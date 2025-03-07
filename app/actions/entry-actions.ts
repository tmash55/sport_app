"use server";

import { createClient } from "@/libs/supabase/server";
import { revalidatePath } from "next/cache";

interface Player {
  id: string;
  first_name: string;
  last_name: string;
  positions: string[];
  price: number;
  school: string;
}

interface CreateEntryData {
  leagueId: string;
  entryName: string;
  selectedPlayers: Record<string, Player>;
  leagueMemberId: string;
}

export async function createEntry(data: CreateEntryData) {
  const supabase = createClient();

  try {
    const { leagueId, entryName, selectedPlayers, leagueMemberId } = data;

    // Format the roster data
    const roster = Object.entries(selectedPlayers).reduce(
      (acc, [slotId, player]) => {
        acc[slotId] = { player_id: player.id, price: player.price };
        return acc;
      },
      {} as Record<string, { player_id: string; price: number }>
    );

    // Get the current entry number for this league
    const { data: entries, error: entriesError } = await supabase
      .from("roster_entries")
      .select("entry_number")
      .eq("league_id", leagueId)
      .order("entry_number", { ascending: false })
      .limit(1);

    if (entriesError) throw entriesError;

    const entryNumber = entries.length > 0 ? entries[0].entry_number + 1 : 1;

    // Insert the entry
    const { data: entryData, error: entryError } = await supabase
      .from("roster_entries")
      .insert({
        league_id: leagueId,
        league_member_id: leagueMemberId,
        entry_number: entryNumber,
        entry_name: entryName,
        roster: roster,
        valid_entry: true,
        is_dqd: false,
      })
      .select()
      .single();

    if (entryError) throw entryError;

    // Revalidate the entries page
    revalidatePath(`/leagues/${leagueId}/my-entries`);

    return { success: true, entryId: entryData.id };
  } catch (error) {
    console.error("Error creating entry:", error);
    return { success: false, error: "Failed to create entry" };
  }
}

export async function deleteEntry(
  entryId: string,
  leagueId: string,
  deleterId: string
) {
  const supabase = createClient();

  try {
    // Call the RPC function instead of directly deleting
    const { error } = await supabase.rpc("delete_entry_with_log", {
      entry_id: entryId,
      deleter_id: deleterId, // Track who deleted it
    });

    if (error) throw error;

    // Revalidate the entries page
    revalidatePath(`/leagues/${leagueId}/my-entries`);

    return { success: true };
  } catch (error) {
    console.error("Error deleting entry:", error);
    return { success: false, error: "Failed to delete entry" };
  }
}

export async function renameEntry(
  entryId: string,
  newName: string,
  leagueId: string
) {
  const supabase = createClient();

  try {
    const { error } = await supabase
      .from("roster_entries")
      .update({ entry_name: newName })
      .eq("id", entryId);

    if (error) throw error;

    // Revalidate the entries page
    revalidatePath(`/leagues/${leagueId}/my-entries`);

    return { success: true };
  } catch (error) {
    console.error("Error renaming entry:", error);
    return { success: false, error: "Failed to rename entry" };
  }
}

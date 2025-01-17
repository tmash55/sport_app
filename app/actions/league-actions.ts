'use server'

import { createClient } from "@/libs/supabase/server"
import { revalidatePath } from "next/cache"

export async function createLeague(name: string, maxTeams: number) {
  const supabase = createClient();

  try {
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { error: "User not authenticated" };
    }

    // Fetch the user's display_name
    const { data: userData, error: userDataError } = await supabase
      .from("users")
      .select("display_name")
      .eq("id", user.id)
      .single();

    if (userDataError) {
      return { error: "Failed to fetch user data" };
    }

    const displayName = userData?.display_name || user.email?.split("@")[0] || "Unknown";

    // Insert the new league with maxTeams
    const { data, error } = await supabase
      .from("leagues")
      .insert({
        name: name,
        commissioner_id: user.id,
        max_teams: maxTeams, // Add max_teams to the leagues table
      })
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    if (!data) {
      return { error: "No data returned from league creation" };
    }

    // Add commissioner as a league member with team_name set to display_name
    const { error: memberError } = await supabase
      .from("league_members")
      .insert({
        league_id: data.id,
        user_id: user.id,
        team_name: displayName,
      });

    if (memberError) {
      return { error: memberError.message };
    }

    // Create default league_members records for remaining spots
    const defaultMembers = Array.from({ length: maxTeams - 1 }, (_, index) => ({
      league_id: data.id,
      user_id: null,
      team_name: `Team ${index + 2}`, // Generate team_name (e.g., Team 2, Team 3, etc.)
      joined_at: null,
      draft_position: null,
      avatar_url: null,
    }));

    const { error: defaultMembersError } = await supabase
      .from("league_members")
      .insert(defaultMembers);

    if (defaultMembersError) {
      return { error: defaultMembersError.message };
    }

    revalidatePath("/dashboard/leagues");
    return { leagueId: data.id };
  } catch (error) {
    console.error("Error creating league:", error);
    return {
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}


export async function getLeagueName(leagueId: string) {
  const supabase = createClient()
  const { data: league } = await supabase
    .from('leagues')
    .select('name')
    .eq('id', leagueId)
    .single()

  return league?.name || leagueId
}

export async function updateLeagueMaxTeams(leagueId: string, newMaxTeams: number) {
  const supabase = createClient();

  try {
    // Call the RPC function to handle the logic in the database
    const { data, error: rpcError } = await supabase.rpc("update_max_teams_transaction", {
      league_id: leagueId,
      max_teams: newMaxTeams,
    });

    if (rpcError) {
      console.error("RPC Error:", rpcError.message);
      return { error: rpcError.message };
    }

    return { success: true, result: data };
  } catch (error) {
    console.error("Error updating league max_teams via RPC:", error);
    return {
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}





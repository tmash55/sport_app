"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RosterBuilder } from "@/components/NFL-Draft/RosterBuilder";
import { PlayerTable } from "@/components/NFL-Draft/PlayerTable";
import { useNflDraft, type Position } from "@/app/context/NflDraftContext";
import { Card } from "@/components/ui/card";
import { createClient } from "@/libs/supabase/client";
import { useUser } from "@/app/context/UserProvider";
import { toast } from "@/hooks/use-toast";

interface Player {
  id: string;
  first_name: string;
  last_name: string;
  positions: Position[];
  price: number;
  school: string;
}

export default function CreateEntryPage() {
  const router = useRouter();
  const { league, players, refetchData } = useNflDraft();
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [entryName, setEntryName] = useState("");
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(
    null
  );
  const [selectedPlayers, setSelectedPlayers] = useState<
    Record<string, Player>
  >({});
  const [currentSlotId, setCurrentSlotId] = useState<string | null>(null);
  const [remainingBudget, setRemainingBudget] = useState(50000);
  const { user } = useUser();
  useEffect(() => {
    if (players.length > 0) {
      setAvailablePlayers(players);
    }
  }, [players]);

  const handleSelectPosition = (position: Position, slotId: string) => {
    console.log("handleSelectPosition called with:", { position, slotId });
    setSelectedPosition(position);
    setCurrentSlotId(slotId);
    // Clear the player from the selected slot if there was one
    if (selectedPlayers[slotId]) {
      const updatedPlayers = { ...selectedPlayers };
      delete updatedPlayers[slotId];
      setSelectedPlayers(updatedPlayers);
      setRemainingBudget((prev) => prev + selectedPlayers[slotId].price);
    }
  };

  const handleSelectPlayer = (player: Player) => {
    console.log("handleSelectPlayer called with player:", player);
    console.log("Current selectedPosition:", selectedPosition);
    console.log("Current currentSlotId:", currentSlotId);
    console.log("Current selectedPlayers:", selectedPlayers);
    console.log("Current remainingBudget:", remainingBudget);

    if (!currentSlotId || !selectedPosition) {
      console.log("No slot or position selected");
      return;
    }

    if (
      remainingBudget >= player.price &&
      !Object.values(selectedPlayers).some((p) => p.id === player.id)
    ) {
      let canFillSlot = false;

      // Check if player can fill the current slot
      if (selectedPosition === "OL") {
        canFillSlot = ["OG", "OT", "C"].some((pos) =>
          player.positions.includes(pos as Position)
        );
      } else {
        canFillSlot = player.positions.includes(selectedPosition);
      }

      console.log("Can fill slot:", canFillSlot);

      if (canFillSlot) {
        setSelectedPlayers((prev) => ({
          ...prev,
          [currentSlotId]: player,
        }));
        setRemainingBudget((prev) => prev - player.price);
        setSelectedPosition(null);
        setCurrentSlotId(null);

        // Remove the selected player from available players
        setAvailablePlayers((prev) => prev.filter((p) => p.id !== player.id));
      } else {
        console.log("Player cannot fill the selected slot");
      }
    } else {
      console.log(
        "Player not added: Either not enough budget or player already selected"
      );
    }
  };

  const handleRemovePlayer = (player: Player, slotId: string) => {
    const newSelectedPlayers = { ...selectedPlayers };
    delete newSelectedPlayers[slotId];
    setSelectedPlayers(newSelectedPlayers);
    setRemainingBudget((prev) => prev + player.price);

    // Add the removed player back to available players
    setAvailablePlayers((prev) => [...prev, player]);
  };

  const handleCreateEntry = async () => {
    if (!league?.id) {
      toast({
        title: "Error",
        description: "League or member information is missing.",
        variant: "destructive",
      });
      console.error("League ID is missing.");
      return;
    }

    if (!entryName || Object.keys(selectedPlayers).length < 8) {
      toast({
        title: "Incomplete Entry",
        description:
          "Entry name is required and at least 8 players must be selected.",
        variant: "destructive",
      });
      console.error(
        "Entry name is required and at least 8 players must be selected."
      );
      return;
    }

    try {
      const supabase = createClient();

      // Fetch the user's league_member_id
      const { data: leagueMember, error: memberError } = await supabase
        .from("league_members")
        .select("id")
        .eq("league_id", league.id)
        .eq("user_id", user?.id)
        .single();

      if (memberError || !leagueMember) {
        throw new Error("Error fetching league member ID");
      }

      const league_member_id = leagueMember.id;

      // Fetch existing entries to determine the next entry_number and check for duplicate names
      const { data: existingEntries, error: entriesError } = await supabase
        .from("roster_entries")
        .select("entry_number, entry_name")
        .eq("league_member_id", league_member_id)
        .eq("league_id", league.id)
        .order("entry_number", { ascending: false });

      if (entriesError) {
        throw new Error("Error fetching existing entries");
      }

      const existingEntryNumbers = existingEntries.map((e) => e.entry_number);
      const existingEntryNames = existingEntries.map((e) =>
        e.entry_name.toLowerCase()
      );
      const settings = league.settings ? JSON.parse(league.settings) : {};
      const maxEntries = settings.max_entries_per_user || 1;

      if (existingEntryNumbers.length >= maxEntries) {
        toast({
          title: "Maximum Entries Reached",
          description: `You have reached the maximum number of entries (${maxEntries}) for this league.`,
          variant: "destructive",
        });
        console.error(
          "User has reached the max number of entries for this league."
        );
        return;
      }

      // Determine unique entry name
      let newEntryName = entryName.trim();
      let counter = 1;

      while (existingEntryNames.includes(newEntryName.toLowerCase())) {
        newEntryName = `${entryName.trim()} (${counter})`;
        counter++;
      }

      // Determine the next available entry_number
      let newEntryNumber = 1;
      while (existingEntryNumbers.includes(newEntryNumber)) {
        newEntryNumber++;
      }

      // Prepare the roster JSON
      const roster = Object.entries(selectedPlayers).reduce(
        (acc, [slot, player]) => ({
          ...acc,
          [slot]: {
            id: player.id,
            first_name: player.first_name,
            last_name: player.last_name,
            name: `${player.first_name} ${player.last_name}`,
            positions: player.positions,
            price: player.price,
            school: player.school,
          },
        }),
        {}
      );

      // Insert new entry into the database
      const { data, error } = await supabase.from("roster_entries").insert([
        {
          league_member_id,
          league_id: league.id,
          entry_name: newEntryName, // Ensure unique name
          entry_number: newEntryNumber, // Ensure unique entry number per user
          roster: roster,
          valid_entry: true,
          is_dqd: false,
        },
      ]);

      if (error) {
        throw error;
      }

      console.log(
        "Final roster before saving:",
        JSON.stringify(roster, null, 2)
      );

      await refetchData();

      // Redirect user to My Entries page
      router.push(`/dashboard/pools/nfl-draft/${league?.id}/my-entries`);
    } catch (error) {
      console.error("Error creating entry:", error);
    }
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-4">
          Create New Entry
        </h1>
        <div className="max-w-md">
          <Input
            placeholder="Entry Name"
            value={entryName}
            onChange={(e) => setEntryName(e.target.value)}
            className="text-lg"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[400px,1fr]">
        <div className="space-y-6">
          <RosterBuilder
            selectedPlayers={selectedPlayers}
            onSelectPosition={handleSelectPosition}
            onRemovePlayer={handleRemovePlayer}
            remainingBudget={remainingBudget}
            leagueFormat={
              (league?.settings ? JSON.parse(league.settings).format : null) ||
              "both"
            }
          />
          <Card className="p-4">
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={() =>
                  router.push(
                    `/dashboard/pools/nfl-draft/${league?.id}/my-entries`
                  )
                }
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateEntry}
                disabled={!entryName || Object.keys(selectedPlayers).length < 8}
              >
                Create Entry
              </Button>
            </div>
          </Card>
        </div>

        <PlayerTable
          selectedPosition={selectedPosition}
          onSelectPlayer={handleSelectPlayer}
          selectedPlayers={selectedPlayers}
          remainingBudget={remainingBudget}
          leagueFormat={
            (league?.settings ? JSON.parse(league.settings).format : null) ||
            "both"
          }
          availablePlayers={availablePlayers}
        />
      </div>
    </div>
  );
}

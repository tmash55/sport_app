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

interface EditEntryPageProps {
  params: {
    id: string;
    entryId: string;
  };
}

export default function EditEntryPage({ params }: EditEntryPageProps) {
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (players.length > 0) {
      setAvailablePlayers(players);
    }
  }, [players]);

  useEffect(() => {
    const fetchEntryData = async () => {
      if (!league?.id || !user?.id) return;
  
      const supabase = createClient();
      const { data: entry, error } = await supabase
        .from("roster_entries")
        .select("*")
        .eq("id", params.entryId)
        .eq("league_id", params.id)
        .single();
  
      if (error || !entry) {
        console.error("Error fetching entry:", error);
        toast({
          title: "Error",
          description: "Entry not found.",
          variant: "destructive",
        });
        router.push(`/dashboard/pools/nfl-draft/${params.id}/my-entries`);
        return;
      }
  
      // ✅ Check if the logged-in user owns the entry
      const userEntry = league?.league_members.find(
        (member: any) => member.id === entry.league_member_id && member.user_id === user.id
      );
  
      if (!userEntry) {
        toast({
          title: "Unauthorized",
          description: "You are not allowed to edit this entry.",
          variant: "destructive",
        });
        router.push(`/dashboard/pools/nfl-draft/${params.id}/my-entries`);
        return;
      }
  
      console.log("Fetched Entry Data:", entry);
  
      setEntryName(entry.entry_name);
  
      // ✅ Parse and format roster data
      const roster =
        typeof entry.roster === "string"
          ? JSON.parse(entry.roster)
          : entry.roster || {};
  
      const formattedRoster = Object.entries(roster).reduce(
        (acc, [slot, player]) => {
          const [firstName, lastName] = player.name.split(" ");
          acc[slot] = {
            ...player,
            first_name: firstName || "",
            last_name: lastName || "",
          };
          return acc;
        },
        {} as Record<string, Player>
      );
  
      setSelectedPlayers(formattedRoster);
  
      const totalCost = Object.values(formattedRoster).reduce(
        (sum, player) => sum + (player.price || 0),
        0
      );
      setRemainingBudget(50000 - totalCost);
  
      setAvailablePlayers((prevPlayers) =>
        prevPlayers.filter(
          (player) =>
            !Object.values(formattedRoster).some((p) => p.id === player.id)
        )
      );
  
      setIsLoading(false);
    };
  
    fetchEntryData();
  }, [league, user, params.entryId, params.id, router]);
  

  const handleSelectPosition = (position: Position, slotId: string) => {
    setSelectedPosition(position);
    setCurrentSlotId(slotId);
    if (selectedPlayers[slotId]) {
      const updatedPlayers = { ...selectedPlayers };
      delete updatedPlayers[slotId];
      setSelectedPlayers(updatedPlayers);
      setRemainingBudget((prev) => prev + selectedPlayers[slotId].price);
      setAvailablePlayers((prev) => [...prev, selectedPlayers[slotId]]);
    }
  };

  const handleSelectPlayer = (player: Player) => {
    if (!currentSlotId || !selectedPosition) return;

    if (
      remainingBudget >= player.price &&
      !Object.values(selectedPlayers).some((p) => p.id === player.id)
    ) {
      let canFillSlot = false;

      if (selectedPosition === "OL") {
        canFillSlot = ["OG", "OT", "C"].some((pos) =>
          player.positions.includes(pos as Position)
        );
      } else {
        canFillSlot = player.positions.includes(selectedPosition);
      }

      if (canFillSlot) {
        setSelectedPlayers((prev) => ({
          ...prev,
          [currentSlotId]: player,
        }));
        setRemainingBudget((prev) => prev - player.price);
        setSelectedPosition(null);
        setCurrentSlotId(null);
        setAvailablePlayers((prev) => prev.filter((p) => p.id !== player.id));
      }
    }
  };

  const handleRemovePlayer = (player: Player, slotId: string) => {
    const newSelectedPlayers = { ...selectedPlayers };
    delete newSelectedPlayers[slotId];
    setSelectedPlayers(newSelectedPlayers);
    setRemainingBudget((prev) => prev + player.price);
    setAvailablePlayers((prev) => [...prev, player]);
  };

  const handleUpdateEntry = async () => {
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

      // Prepare the roster JSON
      const roster = Object.entries(selectedPlayers).reduce(
        (acc, [slot, player]) => ({
          ...acc,
          [slot]: {
            id: player.id,
            name: `${player.first_name} ${player.last_name}`,
            positions: player.positions,
            price: player.price,
            school: player.school,
          },
        }),
        {}
      );

      // Update the entry in the database
      const { error } = await supabase
        .from("roster_entries")
        .update({
          entry_name: entryName,
          roster: roster,
          valid_entry: true,
        })
        .eq("id", params.entryId)
        .eq("league_id", params.id);

      if (error) {
        throw error;
      }

      await refetchData();

      toast({
        title: "Entry Updated",
        description: "Your entry has been successfully updated.",
      });

      // Redirect user to My Entries page
      router.push(`/dashboard/pools/nfl-draft/${params.id}/my-entries`);
    } catch (error) {
      console.error("Error updating entry:", error);
      toast({
        title: "Error",
        description: "Failed to update entry. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Edit Entry</h1>
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
                    `/dashboard/pools/nfl-draft/${params.id}/my-entries`
                  )
                }
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateEntry}
                disabled={!entryName || Object.keys(selectedPlayers).length < 8}
              >
                Update Entry
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

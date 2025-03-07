"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/libs/supabase/client";
import { useUser } from "./UserProvider";

export type Position =
  | "EDGE"
  | "QB"
  | "WR"
  | "RB"
  | "TE"
  | "OT"
  | "OG"
  | "C"
  | "DT"
  | "LB"
  | "CB"
  | "S"
  | "OL"
  | "WR/RB/TE";

interface Player {
  id: string;
  first_name: string;
  last_name: string;
  positions: Position[];
  price: number;
  school: string;
  is_drafted: boolean;
  draft_position: number;
  name: string;
}

interface Entry {
  created_at: string | number | Date;
  user_id: any;
  id: string;
  entry_name: string;
  league_member_id: string;
  roster: Record<string, Player>;
  points: number;
  drafted_count: number;
}

interface NflDraftContextType {
  league: any | null;
  entries: Entry[];
  players: Player[];
  isCommissioner: boolean;
  loading: boolean;
  playersLoading: boolean;
  refetchData: () => Promise<void>;
  updatePool: (updates: Partial<any>) => Promise<void>;
}

const NflDraftContext = createContext<NflDraftContextType | undefined>(
  undefined
);

export function NflDraftProvider({
  leagueId,
  children,
}: {
  leagueId: string;
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { user, isLoading: userLoading } = useUser();
  const [league, setLeague] = useState<any | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isCommissioner, setIsCommissioner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [playersLoading, setPlayersLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchLeagueData();
      fetchPlayers();
    }
  }, [user]);

  async function fetchLeagueData() {
    setLoading(true);
    try {
      const { data: leagueData, error: leagueError } = await supabase
        .from("leagues")
        .select("*, league_members(id, user_id, role), roster_entries(*)")
        .eq("id", leagueId)
        .single();

      if (leagueError || !leagueData) throw leagueError;

      setLeague(leagueData);

      // Get the league_member_id for the current user
      const userLeagueMember = leagueData.league_members.find(
        (member: any) => member.user_id === user?.id
      );
       // Check if the user is a commissioner
       const userIsCommissioner = userLeagueMember?.role === "commissioner"
       setIsCommissioner(userIsCommissioner)

      if (!userLeagueMember) {
        setEntries([]);
        return;
      }

      let userEntries: Entry[] = leagueData.roster_entries.map(
        (entry: any) => ({
          ...entry,
          points: 0,
          drafted_count: 0,
        })
      );

      // Fetch latest draft info and update user entries
      const playerIds = userEntries.flatMap((entry) =>
        Object.values(entry.roster).map((player: any) => player.id)
      );

      if (playerIds.length > 0) {
        const { data: draftedPlayers, error } = await supabase
          .from("nfl_players_2025")
          .select("id, is_drafted, draft_position")
          .in("id", playerIds);

        if (error) throw error;

        // Update entries with draft data
        userEntries = userEntries.map((entry) => {
          let points = 0;
          let draftedCount = 0;
          const updatedRoster = Object.entries(entry.roster).reduce(
            (acc, [position, player]) => {
              const draftedPlayer = draftedPlayers.find(
                (p) => p.id === player.id
              );
              if (draftedPlayer) {
                acc[position] = {
                  ...player,
                  is_drafted: draftedPlayer.is_drafted,
                  draft_position: draftedPlayer.draft_position,
                };
                if (draftedPlayer.is_drafted) {
                  points += draftedPlayer.draft_position;
                  draftedCount++;
                }
              } else {
                acc[position] = player;
              }
              return acc;
            },
            {} as Record<string, Player>
          );

          return {
            ...entry,
            roster: updatedRoster,
            points,
            drafted_count: draftedCount,
          };
        });
      }

      setEntries(userEntries);
    } catch (error) {
      console.error("Error fetching league data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchPlayers() {
    setPlayersLoading(true);
    try {
      const { data, error } = await supabase
        .from("nfl_players_2025")
        .select("*")
        .order("price", { ascending: false });

      if (error) throw error;

      // Convert the position string to an array of positions
      const playersWithPositions =
        data?.map((player) => ({
          ...player,
          positions: player.position.split(",").map((p: string) => p.trim()),
        })) || [];

      setPlayers(playersWithPositions);
    } catch (error) {
      console.error("Error fetching players:", error);
    } finally {
      setPlayersLoading(false);
    }
  }

  async function updatePool(updates: Partial<any>) {
    try {
      const { data, error } = await supabase
        .from("leagues")
        .update(updates)
        .eq("id", leagueId)
        .single();

      if (error) throw error;

      setLeague((prevLeague: any) => ({ ...prevLeague, ...updates }));
    } catch (error) {
      console.error("Error updating pool:", error);
      throw error;
    }
  }

  if (userLoading) return <div>Loading...</div>;

  return (
    <NflDraftContext.Provider
      value={{
        league,
        entries,
        players,
        isCommissioner,
        loading,
        playersLoading,
        refetchData: fetchLeagueData,
        updatePool,
      }}
    >
      {children}
    </NflDraftContext.Provider>
  );
}

export function useNflDraft() {
  const context = useContext(NflDraftContext);
  if (!context) {
    throw new Error("useNflDraft must be used within an NflDraftProvider");
  }
  return context;
}

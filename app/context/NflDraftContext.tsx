"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/libs/supabase/client";
import { useUser } from "./UserProvider";
import { Skeleton } from "@/components/ui/skeleton";

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
  initialLeagueData,
}: {
  leagueId: string;
  children: React.ReactNode;
  initialLeagueData: any;
}) {
  const supabase = createClient();
  const { user, isLoading: userLoading } = useUser();
  const [league, setLeague] = useState<any | null>(initialLeagueData || null);
  const [entries, setEntries] = useState<Entry[]>(initialLeagueData?.roster_entries || []);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isCommissioner, setIsCommissioner] = useState<boolean | null>(
    initialLeagueData ? initialLeagueData.commissioner_id === user?.id : null
  );
  const [loading, setLoading] = useState(!initialLeagueData);
  const [playersLoading, setPlayersLoading] = useState(true);

  useEffect(() => {
    if (!initialLeagueData && user) {
      fetchLeagueData();
    } else if (initialLeagueData) {
      // ✅ Set `isCommissioner` when `initialLeagueData` exists
      setIsCommissioner(initialLeagueData.commissioner_id === user?.id);
    }
    fetchPlayers();
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

  if (userLoading) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-6 space-y-6">
        <Skeleton className="h-[200px] w-full rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-[300px] col-span-1 md:col-span-2 rounded-lg" />
          <div className="space-y-6">
            <Skeleton className="h-[140px] rounded-lg" />
            <Skeleton className="h-[140px] rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

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

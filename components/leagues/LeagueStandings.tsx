"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/libs/supabase/client";
import { Database } from "@/types/database";
import { cn } from "@/lib/utils";

type LeagueMember = Database['public']['Tables']['league_members']['Row'] & {
  team_name: string;
  total_score: number;
  round_1_score: number;
  round_2_score: number;
  round_3_score: number;
  round_4_score: number;
  round_5_score: number;
  round_6_score: number;
  teams_remaining: number;
};

type DraftPick = Database['public']['Tables']['draft_picks']['Row'] & {
  league_teams: {
    global_teams: Database['public']['Tables']['global_teams']['Row'];
  };
};

type LeagueSettings = Database['public']['Tables']['league_settings']['Row'];

interface LeagueStandingsProps {
  leagueId: string;
  currentUserId: string; // Add currentUserId prop
}

export function LeagueStandings({ leagueId, currentUserId }: LeagueStandingsProps) {
  const [leagueMembers, setLeagueMembers] = useState<LeagueMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);

        // Fetch league members with team_name directly from league_members table
        const { data: membersData, error: membersError } = await supabase
          .from("league_members")
          .select("*, team_name")
          .eq("league_id", leagueId);

        if (membersError) throw membersError;

        // Fetch draft picks with team information for this league
        const { data: draftPicksData, error: draftPicksError } = await supabase
          .from("draft_picks")
          .select(`
            id,
            league_member_id,
            team_id,
            league_teams (
              id,
              global_teams (
                id,
                is_eliminated,
                round_1_win,
                round_2_win,
                round_3_win,
                round_4_win,
                round_5_win,
                round_6_win
              )
            )
          `)
          .eq("league_id", leagueId);

        if (draftPicksError) throw draftPicksError;

        // Fetch league settings
        const { data: leagueSettings, error: settingsError } = await supabase
          .from("league_settings")
          .select("*")
          .eq("league_id", leagueId)
          .single();

        if (settingsError) throw settingsError;

        if (!membersData || membersData.length === 0) {
          setLeagueMembers([]);
          return;
        }

        // Process the data to calculate scores and teams remaining
        const processedData = membersData.map((member) => {
          const memberDraftPicks = draftPicksData.filter(
            (pick) => pick.league_member_id === member.id
          ) as DraftPick[];

          const teamsRemaining = memberDraftPicks.filter(
            (pick) => !pick.league_teams.global_teams.is_eliminated
          ).length;

          const roundScores = [1, 2, 3, 4, 5, 6].map((round) => {
            const roundScore = memberDraftPicks.reduce((sum, pick) => {
              const teamWon = pick.league_teams.global_teams[`round_${round}_win` as keyof typeof pick.league_teams.global_teams];
              if (teamWon) {
                return sum + (leagueSettings[`round_${round}_score` as keyof LeagueSettings] as number);
              }
              return sum;
            }, 0);
            return roundScore;
          });

          const totalScore = roundScores.reduce((sum, score) => sum + score, 0);

          return {
            ...member,
            teams_remaining: teamsRemaining,
            round_1_score: roundScores[0],
            round_2_score: roundScores[1],
            round_3_score: roundScores[2],
            round_4_score: roundScores[3],
            round_5_score: roundScores[4],
            round_6_score: roundScores[5],
            total_score: totalScore,
          };
        });

        setLeagueMembers(processedData);
      } catch (e) {
        console.error("Error in fetchData:", e);
        setError(e instanceof Error ? e.message : "An unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();

    // Set up real-time subscription for updates
    const leagueChannel = supabase
      .channel('league_standings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'global_teams',
        },
        fetchData
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'league_members',
          filter: `league_id=eq.${leagueId}`,
        },
        fetchData
      )
      .subscribe();

    return () => {
      supabase.removeChannel(leagueChannel);
    };
  }, [leagueId, supabase]);

  if (isLoading)
    return <div className="text-center py-4">Loading standings...</div>;
  if (error)
    return (
      <div className="text-center py-4 text-red-500">
        Error loading standings: {error}
      </div>
    );

  // Sort league members by total score in descending order
  const sortedLeagueMembers = [...leagueMembers].sort(
    (a, b) => b.total_score - a.total_score
  );

  return (
    <div className="overflow-x-auto">
      <h2 className="text-2xl font-bold mb-4">League Standings</h2>
      {sortedLeagueMembers.length === 0 ? (
        <p className="text-center py-4">No standings data available.</p>
      ) : (
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Rank
              </th>
              <th scope="col" className="px-6 py-3">
                Team Name
              </th>
              <th scope="col" className="px-6 py-3">
                Teams Remaining
              </th>
              <th scope="col" className="px-6 py-3">
                Round 1
              </th>
              <th scope="col" className="px-6 py-3">
                Round 2
              </th>
              <th scope="col" className="px-6 py-3">
                Round 3
              </th>
              <th scope="col" className="px-6 py-3">
                Round 4
              </th>
              <th scope="col" className="px-6 py-3">
                Round 5
              </th>
              <th scope="col" className="px-6 py-3">
                Round 6
              </th>
              <th scope="col" className="px-6 py-3">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedLeagueMembers.map((member, index) => {
              const isCurrentUser = member.user_id === currentUserId;
              return (
                <tr
                  key={member.id}
                  className={cn(
                    "border-b transition-colors",
                    isCurrentUser 
                      ? "bg-primary/5 dark:bg-primary/10" 
                      : "bg-white dark:bg-gray-800",
                    "hover:bg-muted/50 dark:hover:bg-muted/50"
                  )}
                >
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {index + 1}
                  </td>
                  <td className={cn(
                    "px-6 py-4",
                    isCurrentUser && "font-bold text-primary"
                  )}>
                    {member.team_name}
                    {isCurrentUser && <span className="ml-2 text-xs">(You)</span>}
                  </td>
                  <td className="px-6 py-4">{member.teams_remaining}</td>
                  <td className="px-6 py-4">{member.round_1_score}</td>
                  <td className="px-6 py-4">{member.round_2_score}</td>
                  <td className="px-6 py-4">{member.round_3_score}</td>
                  <td className="px-6 py-4">{member.round_4_score}</td>
                  <td className="px-6 py-4">{member.round_5_score}</td>
                  <td className="px-6 py-4">{member.round_6_score}</td>
                  <td className={cn(
                    "px-6 py-4 font-bold",
                    isCurrentUser && "text-primary"
                  )}>
                    {member.total_score}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}


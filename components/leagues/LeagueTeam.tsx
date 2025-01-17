"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/libs/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, X } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Database } from "@/types/database";
import { cn } from "@/lib/utils";

type LeagueMember = Database['public']['Tables']['league_members']['Row'] & {
  users: {
    email: string;
    display_name: string | null;
  };
};

type DraftedTeam = Database['public']['Tables']['league_teams']['Row'] & {
  global_teams: Database['public']['Tables']['global_teams']['Row'];
  scores: number[];
  totalScore: number;
};

interface LeagueTeamProps {
  leagueId: string;
  userId: string;
}

export function LeagueTeam({ leagueId, userId }: LeagueTeamProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [leagueMember, setLeagueMember] = useState<LeagueMember | null>(null);
  const [draftedTeams, setDraftedTeams] = useState<DraftedTeam[]>([]);
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: member, error: memberError } = await supabase
          .from("league_members")
          .select("id, team_name, avatar_url, users(email, display_name)")
          .eq("league_id", leagueId)
          .eq("user_id", userId)
          .single();

        if (memberError) throw memberError;
        setLeagueMember(member);

        const { data: picks, error: picksError } = await supabase
          .from("draft_picks")
          .select(`
            id,
            league_teams (
              id,
              name,
              global_teams (
                id,
                seed,
                logo_filename,
                round_1_win,
                round_2_win,
                round_3_win,
                round_4_win,
                round_5_win,
                round_6_win,
                is_eliminated
              )
            )
          `)
          .eq("league_id", leagueId)
          .eq("league_member_id", member.id)
          .order("pick_number", { ascending: true });

        if (picksError) throw picksError;

        const { data: settings, error: settingsError } = await supabase
          .from("league_settings")
          .select("*")
          .eq("league_id", leagueId)
          .single();

        if (settingsError) throw settingsError;

        const teamsWithScores = picks.map((pick) => {
          const team = pick.league_teams;
          const globalTeam = team.global_teams;
          const scores = [
            globalTeam.round_1_win ? settings.round_1_score : 0,
            globalTeam.round_2_win ? settings.round_2_score : 0,
            globalTeam.round_3_win ? settings.round_3_score : 0,
            globalTeam.round_4_win ? settings.round_4_score : 0,
            globalTeam.round_5_win ? settings.round_5_score : 0,
            globalTeam.round_6_win ? settings.round_6_score : 0,
          ];
          const totalScore = scores.reduce((sum, score) => sum + score, 0);
          return { ...team, scores, totalScore };
        });

        setDraftedTeams(teamsWithScores);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load team data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();

    const leagueChannel = supabase
      .channel("league_team_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "league_members",
          filter: `league_id=eq.${leagueId} AND user_id=eq.${userId}`,
        },
        fetchData
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "draft_picks",
          filter: `league_id=eq.${leagueId}`,
        },
        fetchData
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "global_teams",
        },
        fetchData
      )
      .subscribe();

    return () => {
      supabase.removeChannel(leagueChannel);
    };
  }, [leagueId, userId, supabase, toast]);

  if (isLoading) {
    return <Skeleton className="h-[600px] w-full" />;
  }

  const getLogoUrl = (filename: string | null) => {
    return filename ? `/images/team-logos/${filename}` : null;
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-bold">
          {leagueMember?.team_name || leagueMember?.users.display_name || "User's Team"}
        </CardTitle>
        <Avatar className="h-12 w-12">
          <AvatarImage src={leagueMember?.avatar_url || undefined} alt={leagueMember?.users.display_name || "User"} />
          <AvatarFallback>{leagueMember?.users.display_name?.[0] || "U"}</AvatarFallback>
        </Avatar>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {draftedTeams.map((team) => (
            <div
              key={team.id}
              className={cn(
                "flex flex-col sm:flex-row items-start sm:items-center justify-between bg-card rounded-xl border p-4 transition-colors relative",
                team.global_teams.is_eliminated ? "border-destructive" : "hover:bg-accent/50"
              )}
            >
              <div className="flex items-center gap-4 mb-4 sm:mb-0">
                <div className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full",
                  team.global_teams.is_eliminated ? "bg-destructive/10" : "bg-muted"
                )}>
                  {team.global_teams.logo_filename ? (
                    <img
                      src={getLogoUrl(team.global_teams.logo_filename) || "/placeholder.svg"}
                      alt={`${team.name} logo`}
                      className={cn(
                        "h-10 w-10 object-contain",
                        team.global_teams.is_eliminated && "opacity-50"
                      )}
                    />
                  ) : (
                    <Trophy className={cn(
                      "h-6 w-6",
                      team.global_teams.is_eliminated ? "text-destructive" : "text-primary"
                    )} />
                  )}
                </div>
                <div>
                  <div className={cn(
                    "font-semibold flex items-center gap-2",
                    team.global_teams.is_eliminated && "text-destructive"
                  )}>
                    {team.name}
                    {team.global_teams.is_eliminated && (
                      <span className="text-xs bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded-full flex items-center">
                        <X className="w-3 h-3 mr-1" />
                        Eliminated
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">Seed: {team.global_teams.seed}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-4 sm:mt-0">
                {team.scores.map((score, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center justify-center"
                  >
                    <div className="text-xs text-muted-foreground mb-1">R{index + 1}</div>
                    <div className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg font-medium",
                      team.global_teams.is_eliminated ? "bg-destructive/10 text-destructive" : "bg-muted"
                    )}>
                      {score}
                    </div>
                  </div>
                ))}
                <div className="flex flex-col items-center justify-center">
                  <div className="text-xs text-muted-foreground mb-1">Total</div>
                  <div className={cn(
                    "flex h-10 min-w-[4rem] items-center justify-center rounded-lg font-semibold px-3",
                    team.global_teams.is_eliminated ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                  )}>
                    {team.totalScore}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}


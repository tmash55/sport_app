import { createClient } from "@/libs/supabase/server";
import { calculateTeamScore } from "@/utils/calculateTeamScore";
import { NextResponse } from "next/server";
import { Database } from "@/types/database";

type LeagueTeam = Database["public"]["Tables"]["league_teams"]["Row"] & {
  global_teams: Database["public"]["Tables"]["global_teams"]["Row"];
};

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();

  // Fetch league settings
  const { data: leagueSettings, error: settingsError } = await supabase
    .from("league_settings")
    .select("*")
    .eq("league_id", params.id)
    .single();

  if (settingsError) {
    return NextResponse.json({ error: "Failed to fetch league settings" }, { status: 500 });
  }

  // Fetch league teams and their global team data
  const { data: leagueTeams, error: teamsError } = await supabase
    .from("league_teams")
    .select(`
      id,
      name,
      league_member_id,
      global_teams (*)
    `)
    .eq("league_id", params.id);

  if (teamsError) {
    return NextResponse.json({ error: "Failed to fetch league teams" }, { status: 500 });
  }

  // Calculate scores and create standings
  const teamScores = (leagueTeams as LeagueTeam[]).map((leagueTeam) => ({
    id: leagueTeam.id,
    name: leagueTeam.name,
    league_member_id: leagueTeam.league_member_id,
    score: calculateTeamScore(leagueTeam.global_teams, leagueSettings),
  }));

  // Group scores by league member
  const memberStandings = teamScores.reduce<Record<string, { totalScore: number; teams: typeof teamScores }>>((acc, team) => {
    if (!acc[team.league_member_id]) {
      acc[team.league_member_id] = { totalScore: 0, teams: [] };
    }
    acc[team.league_member_id].totalScore += team.score;
    acc[team.league_member_id].teams.push(team);
    return acc;
  }, {});

  // Convert to array and sort by total score
  const standings = Object.entries(memberStandings).map(([memberId, data]) => ({
    league_member_id: memberId,
    totalScore: data.totalScore,
    teams: data.teams,
  })).sort((a, b) => b.totalScore - a.totalScore);

  return NextResponse.json({ standings });
}


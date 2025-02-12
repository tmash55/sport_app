import { createClient } from "@/libs/supabase/client"
import type { Matchup, GlobalTeam } from "@/types/draft"

export async function getMatchups(leagueId: string): Promise<Matchup[] | null> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc("get_matchups", { p_league_id: leagueId })

  if (error) {
    console.error("Error fetching matchups:", error)
    return null
  }

  // Transform the data to match the Matchup interface
  const matchups: Matchup[] = data.map((m: any) => ({
    id: m.id,
    round: m.round,
    group: m.group,
    region: m.region,
    home_score: m.home_score,
    away_score: m.away_score,
    game_status: m.game_status as "scheduled" | "in_progress" | "completed",
    home_team: m.home_team as GlobalTeam,
    away_team: m.away_team as GlobalTeam,
    winning_team: m.winning_team as GlobalTeam | null,
  }))

  return matchups
}


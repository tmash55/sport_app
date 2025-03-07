"use server"

import { createClient } from "@/libs/supabase/server"



export type PlayerDraftStats = {
  player_id: string
  name: string
  position: string
  team: string
  draft_count: number
  draft_percentage: number
  total_entries: number
}

export async function getPlayerDraftPercentages(leagueId: string): Promise<PlayerDraftStats[]> {
  const supabase = createClient()

  // Get all NFL players
  const { data: players, error: playersError } = await supabase.from("nfl_rosters").select("id, name, position, team")

  if (playersError) {
    console.error("Error fetching players:", playersError)
    throw new Error("Failed to fetch players")
  }

  // Get all entries for the league
  const { data: entries, error: entriesError } = await supabase
    .from("entries")
    .select("id, roster")
    .eq("league_id", leagueId)

  if (entriesError) {
    console.error("Error fetching entries:", entriesError)
    throw new Error("Failed to fetch entries")
  }

  const totalEntries = entries.length

  // Calculate draft counts for each player
  const draftCounts: Record<string, number> = {}

  entries.forEach((entry) => {
    const roster = entry.roster as { player_ids: string[] }
    if (roster && roster.player_ids) {
      roster.player_ids.forEach((playerId) => {
        draftCounts[playerId] = (draftCounts[playerId] || 0) + 1
      })
    }
  })

  // Create the final stats array
  const playerStats: PlayerDraftStats[] = players.map((player) => {
    const draftCount = draftCounts[player.id] || 0
    const draftPercentage = totalEntries > 0 ? (draftCount / totalEntries) * 100 : 0

    return {
      player_id: player.id,
      name: player.name,
      position: player.position,
      team: player.team,
      draft_count: draftCount,
      draft_percentage: draftPercentage,
      total_entries: totalEntries,
    }
  })

  // Sort by draft percentage (descending)
  return playerStats.sort((a, b) => b.draft_percentage - a.draft_percentage)
}


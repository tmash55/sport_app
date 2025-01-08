import { createClient } from "@/libs/supabase/client"

export async function fetchLeagueData(leagueId: string) {
  const supabase = createClient()

  try {
    const [leagueData, leagueSettingsData, leagueMemberData, draftData] = await Promise.all([
      supabase
        .from('leagues')
        .select('*')
        .eq('id', leagueId)
        .single(),
      supabase
        .from('league_settings')
        .select('*')
        .eq('league_id', leagueId)
        .single(),
      supabase
        .from('league_members')
        .select(`
          *,
          users (
            id,
            email,
            display_name
          )
        `)
        .eq('league_id', leagueId),
      supabase
        .from('drafts')
        .select('*')
        .eq('league_id', leagueId)
        .single()
    ])

    return {
      league: leagueData.data,
      leagueSettings: leagueSettingsData.data,
      leagueMembers: leagueMemberData.data,
      draft: draftData.data
    }
  } catch (error) {
    console.error('Error fetching league data:', error)
    throw new Error('Failed to fetch league data')
  }
}


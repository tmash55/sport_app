import useSWR from "swr"
import { createClient } from "@/libs/supabase/client"

const supabase = createClient()

async function fetchLeagueData(leagueId: string) {
  const { data: userData } = await supabase.auth.getUser()
  const userId = userData.user?.id

  const { data, error } = await supabase
    .from("leagues")
    .select(`
      *,
      contests:contest_id (
        id,
        name,
        contest_type,
        sport
      ),
      league_members (
        id,
        user_id,
        role,
        draft_position,
        team_name,
        users:user_id (
          id,
          email,
          first_name,
          last_name,
          display_name
        )
      ),
      league_settings!inner (
        max_teams,
        round_1_score,
        round_2_score,
        round_3_score,
        round_4_score,
        round_5_score,
        round_6_score,
        upset_multiplier
      ),
      commissioner:commissioner_id (
        id,
        email,
        first_name,
        last_name,
        display_name
      ),
      drafts (
        status,
        draft_pick_timer
      ),
      draft_picks (
        id,
        league_member_id,
        pick_number,
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
      )
    `)
    .eq("id", leagueId)
    .single()

  if (error) throw error

  // Use the status from the drafts table, defaulting to "pre_draft" if no drafts exist
  const draft_status = data.drafts && data.drafts.length > 0 ? data.drafts[0].status : "pre_draft"

  // Return the data with the correct draft status and user ID
  return { ...data, user_id: userId, draft_status }
}

export function useLeagueData(leagueId: string) {
  const { data, error, isValidating, mutate } = useSWR(`league-${leagueId}`, () => fetchLeagueData(leagueId), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 180000, // Refresh every 3 minutes
  })

  return {
    leagueData: data,
    isLoading: !error && !data,
    isValidating,
    error,
    mutate,
  }
}


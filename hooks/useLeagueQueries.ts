import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/libs/supabase/client"
import type { Draft, LeagueMember, LeagueTeam, DraftPick } from "@/types/draft"

const supabase = createClient()

export function useDraftQuery(leagueId: string) {
    return useQuery({
      queryKey: ["draft", leagueId],
      queryFn: async () => {
        const { data, error } = await supabase.from("drafts").select("*").eq("league_id", leagueId).single()
        if (error) throw error
        return data as Draft
      },
      staleTime: Number.POSITIVE_INFINITY,
    })
  }

export function useLeagueQuery(leagueId: string) {
  return useQuery({
    queryKey: ["league", leagueId],
    queryFn: async () => {
      const { data, error } = await supabase.from("leagues").select("commissioner_id, name").eq("id", leagueId).single()
      if (error) throw error
      return data
    },
  })
}

export function useLeagueSettingsQuery(leagueId: string) {
  return useQuery({
    queryKey: ["leagueSettings", leagueId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("league_settings")
        .select("max_teams")
        .eq("league_id", leagueId)
        .single()
      if (error) throw error
      return data
    },
  })
}

export function useLeagueMembersQuery(leagueId: string) {
  return useQuery<LeagueMember[]>({
    queryKey: ["leagueMembers", leagueId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("league_members")
        .select("*, users(email, first_name, last_name)")
        .eq("league_id", leagueId)
      if (error) throw error
      return data
    },
    staleTime: Number.POSITIVE_INFINITY,
  })
}

export function useLeagueTeamsQuery(leagueId: string) {
  return useQuery<LeagueTeam[]>({
    queryKey: ["leagueTeams", leagueId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("league_teams")
        .select("*, global_teams(id, seed, logo_filename)")
        .eq("league_id", leagueId)
      if (error) throw error
      return data
    },
  })
}

export function useDraftPicksQuery(draftId: string | undefined) {
    return useQuery<DraftPick[]>({
      queryKey: ["draftPicks", draftId],
      queryFn: async () => {
        if (!draftId) return []
        const { data, error } = await supabase
          .from("draft_picks")
          .select("*, league_teams(*, global_teams(id, seed, logo_filename)), users(email, first_name, last_name)")
          .eq("draft_id", draftId)
  
        if (error) throw error
        return data || [] // ✅ Prevents data from disappearing
      },
      enabled: !!draftId, // ✅ Only fetch if draft exists
      staleTime: 1000 * 60 * 10, // ✅ Data stays fresh for 10 minutes
      placeholderData: [], // ✅ Keeps UI from breaking while refetching
    })
  }
  
  


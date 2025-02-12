import { useEffect, useState } from "react"
import { createClient } from "@/libs/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
  useDraftQuery,
  useLeagueQuery,
  useLeagueSettingsQuery,
  useLeagueMembersQuery,
  useLeagueTeamsQuery,
  useDraftPicksQuery,
} from "./useLeagueQueries"

const supabase = createClient()

export function useDraftState(leagueId: string) {
  const [draftedTeamIds, setDraftedTeamIds] = useState<Set<string>>(new Set())
  const toast = useToast()
  const queryClient = useQueryClient()

  // ✅ Fetch Current User and Ensure Correct Type
  const { data: currentUser, isLoading: isUserLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data, error } = await supabase.auth.getUser()
      if (error) throw error
      return data.user || null
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  })

  // ✅ Fetch League & Draft Data
  const { data: draft, isLoading: isDraftLoading } = useDraftQuery(leagueId)
  const { data: leagueData, isLoading: isLeagueLoading } = useLeagueQuery(leagueId)
  const { data: leagueSettings, isLoading: isSettingsLoading } = useLeagueSettingsQuery(leagueId)
  const { data: leagueMembers, isLoading: isMembersLoading } = useLeagueMembersQuery(leagueId)
  const { data: leagueTeams, isLoading: isTeamsLoading } = useLeagueTeamsQuery(leagueId)

  // ✅ Only fetch draft picks if draft exists
  const { data: draftPicks, isLoading: isPicksLoading } = useDraftPicksQuery(draft?.id)

  // ✅ Improve Loading Logic
  const isLoading =
    isUserLoading ||
    isDraftLoading ||
    isLeagueLoading ||
    isSettingsLoading ||
    isMembersLoading ||
    isTeamsLoading ||
    isPicksLoading

  // ✅ Ensure User ID Matches Type
  const isCommissioner = leagueData?.commissioner_id === currentUser?.id
  const maxTeams = leagueSettings?.max_teams || 0
  const leagueName = leagueData?.name || null

  // ✅ Track Drafted Teams
  useEffect(() => {
    if (draftPicks) {
      setDraftedTeamIds(new Set(draftPicks.map((pick:any) => pick.team_id)))
    }
  }, [draftPicks])

  // ✅ Compute Available Teams
  const availableTeams = leagueTeams?.filter((team) => !draftedTeamIds.has(team.id)) || [] 

  return {
    draft,
    leagueMembers,
    availableTeams,
    draftPicks,
    currentUser,
    isLoading,
    isCommissioner,
    maxTeams,
    draftedTeamIds,
    leagueName,
  }
}

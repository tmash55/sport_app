"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/libs/supabase/client"
import type { Draft, LeagueMember, LeagueTeam, DraftPick } from "@/types/draft"

export function useDraftData(leagueId: string) {
  const [draftData, setDraftData] = useState<{
    draft: Draft | null
    leagueMembers: LeagueMember[]
    availableTeams: LeagueTeam[]
    draftPicks: DraftPick[]
    currentUser: string | null
    isCommissioner: boolean
    maxTeams: number
    leagueName: string | null
  }>({
    draft: null,
    leagueMembers: [],
    availableTeams: [],
    draftPicks: [],
    currentUser: null,
    isCommissioner: false,
    maxTeams: 0,
    leagueName: null,
  })
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetchDraftData = useCallback(async () => {
    setIsLoading(true)
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
      if (userError) throw userError

      // Batch fetch all required data
      const [
        { data: draftData, error: draftError },
        { data: leagueData, error: leagueError },
        { data: settingsData, error: settingsError },
        { data: membersData, error: membersError },
        { data: teamsData, error: teamsError },
      ] = await Promise.all([
        supabase.from("drafts").select("*").eq("league_id", leagueId).single(),
        supabase.from("leagues").select("commissioner_id, name").eq("id", leagueId).single(),
        supabase.from("league_settings").select("max_teams").eq("league_id", leagueId).single(),
        supabase.from("league_members").select("*, users(email, first_name, last_name)").eq("league_id", leagueId),
        supabase.from("league_teams").select("*, global_teams(id, seed, logo_filename)").eq("league_id", leagueId),
      ])

      if (draftError || leagueError || settingsError || membersError || teamsError) {
        throw new Error("Error fetching data")
      }

      const { data: picksData, error: picksError } = await supabase
        .from("draft_picks")
        .select("*, league_teams(*, global_teams(id, seed, logo_filename)), users(email, first_name, last_name)")
        .eq("draft_id", draftData.id)

      if (picksError) throw picksError

      setDraftData({
        draft: draftData,
        leagueMembers: membersData,
        availableTeams: teamsData,
        draftPicks: picksData,
        currentUser: user?.id || null,
        isCommissioner: leagueData.commissioner_id === user?.id,
        maxTeams: settingsData.max_teams,
        leagueName: leagueData.name,
      })
    } catch (error) {
      console.error("Error fetching draft data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [leagueId, supabase])

  useEffect(() => {
    fetchDraftData()
  }, [fetchDraftData])

  return {
    ...draftData,
    isLoading,
    draftedTeamIds: new Set(draftData.draftPicks.map((pick) => pick.team_id)),
    fetchDraftData,
    setDraft: (draft: Draft | null) => setDraftData((prev) => ({ ...prev, draft })),
    setDraftPicks: (draftPicks: DraftPick[]) => setDraftData((prev) => ({ ...prev, draftPicks })),
    setAvailableTeams: (availableTeams: LeagueTeam[]) => setDraftData((prev) => ({ ...prev, availableTeams })),
  }
}


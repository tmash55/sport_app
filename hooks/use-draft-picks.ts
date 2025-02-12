"use client"

import { useCallback } from "react"
import { createClient } from "@/libs/supabase/client"
import { useToast } from "@/hooks/use-toast"
import type { Draft, LeagueMember, LeagueTeam, DraftPick } from "@/types/draft"

export function useDraftPicks(
  draft: Draft | null,
  leagueId: string,
  currentUser: string | null,
  leagueMembers: LeagueMember[],
  availableTeams: LeagueTeam[],
  draftedTeamIds: Set<string>,
  updateState: (updates: { draftPicks?: (prev: DraftPick[]) => DraftPick[]; availableTeams?: (prev: LeagueTeam[]) => LeagueTeam[] }) => void
) {
  const supabase = createClient()
  const { toast } = useToast()

  const getCurrentDrafter = useCallback(() => {
    if (!draft) return null
    const currentPick = draft.current_pick_number
    const totalMembers = leagueMembers.length
    const roundNumber = Math.floor((currentPick - 1) / totalMembers) + 1
    const pickInRound = (currentPick - 1) % totalMembers

    const draftPosition = roundNumber % 2 === 1 ? pickInRound + 1 : totalMembers - pickInRound

    return leagueMembers.find((member) => member.draft_position === draftPosition)
  }, [draft, leagueMembers])

  const isUsersTurn = useCallback(() => {
    return getCurrentDrafter()?.user_id === currentUser
  }, [getCurrentDrafter, currentUser])

  const handleAutoPick = async () => {
    if (!draft) return

    const currentDrafter = getCurrentDrafter()
    if (!currentDrafter) return

    try {
      const availableUndraftedTeams = availableTeams
        .filter((team) => !draftedTeamIds.has(team.id))
        .sort((a, b) => a.global_teams?.seed - b.global_teams?.seed)

      const nextAvailableTeam = availableUndraftedTeams[0]
      if (!nextAvailableTeam) {
        throw new Error("No available teams left")
      }

      const draftPickData = {
        draft_id: draft.id,
        league_id: leagueId,
        league_member_id: currentDrafter.id,
        team_id: nextAvailableTeam.id,
        pick_number: draft.current_pick_number,
        is_auto_pick: true,
      }

      const optimisticPick: DraftPick = {
          id: `temp-${Date.now()}`,
          created_at: new Date().toISOString(),
          draft_id: draft.id,
          league_id: leagueId,
          league_member_id: currentDrafter.id,
          team_id: nextAvailableTeam.id,
          pick_number: draft.current_pick_number,
          is_auto_pick: true,
          user_id: currentDrafter.user_id || "",
          users: currentDrafter.users || null,
          league_teams: nextAvailableTeam,
          league_member: {
              id: "",
              team_name: "",
              users: {
                  display_name: ""
              }
          }
      }
      

      updateState({
        draftPicks: (prev) => [...prev, optimisticPick],
        availableTeams: (prev) => prev.filter((t) => t.id !== nextAvailableTeam.id),
      })

      const { data, error } = await supabase
        .from("draft_picks")
        .insert(draftPickData)
        .select("*, league_teams(id, name, seed, global_teams(name))")
        .single()

      if (error) throw error

      updateState({
        draftPicks: (prev) => prev.map((p) => (p.id === optimisticPick.id ? data : p)),
      })

      toast({
        title: "Auto Pick",
        description: `${currentDrafter.team_name || "Team"} auto-drafted ${data.league_teams.global_teams.name}.`,
      })

      return data
    } catch (error) {
      console.error("Error making auto pick:", error)
      toast({
        title: "Error",
        description: "Failed to make auto pick. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDraftPick = async (teamId: string) => {
    if (!draft || !isUsersTurn()) return

    try {
      const { data: leagueMember, error: leagueMemberError } = await supabase
        .from("league_members")
        .select("id")
        .eq("league_id", leagueId)
        .eq("user_id", currentUser)
        .single()

      if (leagueMemberError) throw leagueMemberError

      const draftPickData = {
        draft_id: draft.id,
        league_id: leagueId,
        user_id: currentUser,
        league_member_id: leagueMember.id,
        team_id: teamId,
        pick_number: draft.current_pick_number,
      }

      const selectedTeam = availableTeams.find((team) => team.id === teamId)
      const optimisticPick: DraftPick = {
          ...draftPickData,
          id: `temp-${Date.now()}`,
          league_teams: selectedTeam,
          users: leagueMembers.find((member) => member.user_id === currentUser)?.users,
          created_at: "",
          league_member: {
              id: "",
              team_name: "",
              users: {
                  display_name: ""
              }
          }
      }

      updateState({
        draftPicks: (prev) => [...prev, optimisticPick],
        availableTeams: (prev) => prev.filter((team) => team.id !== teamId),
      })

      const { data, error } = await supabase
        .from("draft_picks")
        .insert(draftPickData)
        .select("*, league_teams(*), users(email, first_name, last_name)")
        .single()

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Team Already Drafted",
            description: "This team has already been drafted. Please choose another team.",
            variant: "destructive",
          })
        } else {
          throw error
        }
        updateState({
          draftPicks: (prev) => prev.filter((pick) => pick.id !== optimisticPick.id),
          availableTeams: (prev) => [...prev, selectedTeam!],
        })
        return
      }

      updateState({
        draftPicks: (prev) => prev.map((pick) => (pick.id === optimisticPick.id ? data : pick)),
      })

      toast({
        title: "Team Drafted",
        description: `You have successfully drafted ${data.league_teams.name}.`,
      })

      return data
    } catch (error) {
      console.error("Error making draft pick:", error)
      toast({
        title: "Error",
        description: "Failed to make draft pick. Please try again.",
        variant: "destructive",
      })
    }
  }

  return {
    getCurrentDrafter,
    isUsersTurn,
    handleAutoPick,
    handleDraftPick,
  }
}

"use client"

import { useEffect, useCallback, useState, useMemo } from "react"
import { createClient } from "@/libs/supabase/client"
import { useDraftData } from "./use-draft-data"
import { useDraftActions } from "./use-draft-actions"
import { useDraftPicks } from "./use-draft-picks"
import { useMatchups } from "./use-matchups"
import type { DraftPick, LeagueTeam } from "@/types/draft"

export function useDraftState(leagueId: string) {
    const supabase = createClient()
    const {
      draft,
      leagueMembers,
      availableTeams,
      draftPicks,
      currentUser,
      isLoading,
      isCommissioner,
      maxTeams,
      leagueName,
      fetchDraftData,
      setDraft,
    } = useDraftData(leagueId)
  
    const [localDraftPicks, setLocalDraftPicks] = useState<DraftPick[]>(draftPicks)
    const [localAvailableTeams, setLocalAvailableTeams] = useState<LeagueTeam[]>(availableTeams)

    
  
    useEffect(() => {
        setLocalDraftPicks((prev) => (prev.length !== draftPicks.length ? draftPicks : prev));
        setLocalAvailableTeams((prev) => (prev.length !== availableTeams.length ? availableTeams : prev));
      }, [draftPicks, availableTeams]);
      
  
    const draftedTeamIds = useMemo(() => new Set(localDraftPicks.map((pick) => pick.team_id)), [localDraftPicks])
  
    const updateState = useMemo(
        () => (updates: { draftPicks?: (prev: DraftPick[]) => DraftPick[]; availableTeams?: (prev: LeagueTeam[]) => LeagueTeam[] }) => {
          if (updates.draftPicks) setLocalDraftPicks(updates.draftPicks);
          if (updates.availableTeams) setLocalAvailableTeams(updates.availableTeams);
        },
        []
      );
      
  
    const { handleDraftAction, handleSettingsChange, updateDraftState } = useDraftActions(draft, leagueId, maxTeams)
    const { getCurrentDrafter, isUsersTurn, handleAutoPick, handleDraftPick } = useDraftPicks(
      draft,
      leagueId,
      currentUser,
      leagueMembers,
      localAvailableTeams,
      draftedTeamIds,
      updateState,
    )
    const { matchups, matchupsLoading, matchupsError, fetchMatchups } = useMatchups(leagueId)
    useEffect(() => {
        if (draft) {
          fetchMatchups();
        }
      }, [draft, fetchMatchups]);
  
    const handleNewDraftPick = useCallback(
      async (newPickId: string) => {
        try {
          const { data: fullPick, error } = await supabase
            .from("draft_picks")
            .select("*, league_teams(*, global_teams(id, seed, logo_filename))")
            .eq("id", newPickId)
            .single()
  
          if (error || !fullPick) {
            console.error("❌ Error fetching new draft pick:", error || "Pick not found.")
            return
          }
  
          updateState({
            draftPicks: (prevPicks) => {
              const existingPickIndex = prevPicks.findIndex((pick) => pick.id === fullPick.id)
              if (existingPickIndex !== -1) {
                const updatedPicks = [...prevPicks]
                updatedPicks[existingPickIndex] = fullPick
                return updatedPicks
              }
              return [...prevPicks, fullPick]
            },
            availableTeams: (prevTeams) => prevTeams.filter((team) => team.id !== fullPick.team_id),
          })
  
          fetchMatchups()
        } catch (error) {
          console.error("❌ Unexpected error in handleNewDraftPick:", error)
        }
      },
      [supabase, updateState, fetchMatchups],
    )
  
    const subscribeToDraftPicks = useCallback(() => {
      if (!draft) return
  
      console.log("🕒 Listening for real-time draft & draft pick updates...")
  
      const channel = supabase.channel(`draft_room_${draft.id}`)
  
      channel.on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "draft_picks", filter: `draft_id=eq.${draft.id}` },
        async (payload) => {
          console.log("🔄 New draft pick detected!", payload.new)
          await handleNewDraftPick(payload.new.id)
        },
      )
  
      channel.subscribe()
  
      return () => {
        console.log("🛑 Unsubscribing from draft & draft pick updates...")
        supabase.removeChannel(channel)
      }
    }, [draft, supabase, handleNewDraftPick])
  
    useEffect(() => {
      const unsubscribe = subscribeToDraftPicks()
      return () => unsubscribe && unsubscribe()
    }, [subscribeToDraftPicks])
  
    return {
      draft,
      leagueMembers,
      availableTeams: localAvailableTeams,
      draftPicks: localDraftPicks,
      currentUser,
      isLoading,
      isCommissioner,
      maxTeams,
      draftedTeamIds,
      leagueName,
      fetchDraftData,
      handleAutoPick,
      handleDraftAction,
      handleDraftPick,
      handleSettingsChange,
      isUsersTurn,
      getCurrentDrafter,
      matchups,
      matchupsLoading,
      matchupsError,
      fetchMatchups,
      updateDraftState,
    }
  }


"use client"

import { useCallback } from "react"
import { createClient } from "@/libs/supabase/client"
import { useToast } from "@/hooks/use-toast"
import type { Draft, DraftPick } from "@/types/draft"

export function useDraftActions(draft: Draft | null, leagueId: string, maxTeams: number) {
  const supabase = createClient()
  const { toast } = useToast()

  const handleDraftAction = async (action: "start" | "pause" | "resume") => {
    if (!draft) return

    try {
      let newStatus: Draft["status"]
      let timerExpiresAt: string | null = null
      switch (action) {
        case "start":
        case "resume":
          newStatus = "in_progress"
          timerExpiresAt = new Date(Date.now() + draft.draft_pick_timer * 1000).toISOString()
          break
        case "pause":
          newStatus = "paused"
          break
        default:
          return
      }

      const { error } = await supabase
        .from("drafts")
        .update({
          status: newStatus,
          timer_expires_at: timerExpiresAt,
        })
        .eq("id", draft.id)

      if (error) throw error

      toast({
        title: `Draft ${action}ed`,
        description: `The draft has been successfully ${action}ed.`,
      })

      return { newStatus, timerExpiresAt }
    } catch (error) {
      console.error(`Error ${action}ing draft:`, error)
      toast({
        title: "Error",
        description: `Failed to ${action} the draft. Please try again.`,
        variant: "destructive",
      })
    }
  }

  const handleSettingsChange = useCallback(
    async (newSettings: { leagueName: string; minutesPerPick: number }) => {
      try {
        const { error: leagueError } = await supabase
          .from("leagues")
          .update({ name: newSettings.leagueName })
          .eq("id", leagueId)

        if (leagueError) throw leagueError

        const { error: draftError } = await supabase
          .from("drafts")
          .update({ draft_pick_timer: newSettings.minutesPerPick * 60 })
          .eq("id", draft?.id)

        if (draftError) throw draftError

        toast({
          title: "Settings Updated",
          description: "Draft settings have been successfully updated.",
        })
      } catch (error) {
        console.error("Error updating settings:", error)
        toast({
          title: "Error",
          description: "Failed to update settings. Please try again.",
          variant: "destructive",
        })
      }
    },
    [supabase, leagueId, draft, toast],
  )

  const updateDraftState = useCallback(
    async (newPick: DraftPick) => {
      const { data: pickDetails, error } = await supabase
        .from("draft_picks")
        .select(`
          *,
          league_teams (
            *,
            global_teams (
              logo_filename
            )
          )
        `)
        .eq("id", newPick.id)
        .single()

      if (error) {
        console.error("Error fetching full pick details:", error)
        return null
      }

      const newPickNumber = draft!.current_pick_number + 1
      const timerExpiresAt = new Date(Date.now() + draft!.draft_pick_timer * 1000).toISOString()

      const isDraftCompleted = newPickNumber > Math.floor(64 / maxTeams) * maxTeams

      if (isDraftCompleted) {
        const endTime = new Date().toISOString()
        const { error: updateError } = await supabase
          .from("drafts")
          .update({
            current_pick_number: newPickNumber,
            status: "completed",
            end_time: endTime,
          })
          .eq("id", draft!.id)

        if (updateError) throw updateError

        toast({
          title: "Draft Completed",
          description: `The draft has been completed.`,
        })

        return { newPickNumber, status: "completed" as const, endTime }
      } else {
        const { error: updateError } = await supabase
          .from("drafts")
          .update({
            current_pick_number: newPickNumber,
            timer_expires_at: timerExpiresAt,
          })
          .eq("id", draft!.id)

        if (updateError) throw updateError

        return { newPickNumber, timerExpiresAt }
      }
    },
    [draft, maxTeams, supabase, toast],
  )

  return {
    handleDraftAction,
    handleSettingsChange,
    updateDraftState,
  }
}


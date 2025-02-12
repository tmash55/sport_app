"use client"

import { useState } from "react"
import { createClient } from "@/libs/supabase/client"
import type { Draft } from "@/types/draft"

const supabase = createClient()

export function useDraftActions(leagueId: string, onDraftUpdate: (updatedDraft: Draft) => void) {
  const [isActionLoading, setIsActionLoading] = useState(false)

  const handleDraftAction = async (
    draftId: string,
    action: "started" | "paused" | "resumed",
    draftPickTimer: number,
    setDraft: (draft: Draft) => void,
  ) => {
    setIsActionLoading(true)
    try {
      let updateData: Partial<Draft> = {}
      let timerExpiresAt: string | null = null

      switch (action) {
        case "started":
        case "resumed":
          timerExpiresAt = new Date(Date.now() + draftPickTimer * 1000).toISOString()
          updateData = { status: "in_progress", timer_expires_at: timerExpiresAt }
          break
        case "paused":
          updateData = { status: "paused", timer_expires_at: null }
          break
      }

      const { data, error } = await supabase.from("drafts").update(updateData).eq("id", draftId).select().single()

      if (error) throw error

      setDraft(data)
      onDraftUpdate(data)
    } catch (error) {
      console.error(`Error ${action} draft:`, error)
    } finally {
      setIsActionLoading(false)
    }
  }

  return { handleDraftAction, isActionLoading }
}


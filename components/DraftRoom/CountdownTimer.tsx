"use client"

import { useState, useEffect, useMemo } from "react"
import { cn } from "@/lib/utils"
import { createClient } from "@/libs/supabase/client"

interface CountdownTimerProps {
  draftId: string
  status: "pre_draft" | "in_progress" | "paused" | "completed"
  timerExpiresAt: string | null
  onTimerExpire: () => void
  draft: {
    draft_pick_timer: number
  }
}

export function CountdownTimer({ draftId, status, timerExpiresAt, onTimerExpire, draft }: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const calculateTimeRemaining = () => {
      if (status !== "in_progress" || !timerExpiresAt) {
        setTimeRemaining(null)
        return
      }

      const now = new Date().getTime()
      const expiresAt = new Date(timerExpiresAt).getTime()
      const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000))

      setTimeRemaining(remaining)

      if (remaining === 0) {
        onTimerExpire()
      }
    }

    calculateTimeRemaining()
    const interval = setInterval(calculateTimeRemaining, 1000)

    return () => clearInterval(interval)
  }, [status, timerExpiresAt, onTimerExpire])

  useEffect(() => {
    const channel = supabase
      .channel("drafts")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "drafts",
          filter: `id=eq.${draftId}`,
        },
        (payload) => {
          if (payload.new.timer_expires_at) {
            setTimeRemaining(
              Math.max(0, Math.floor((new Date(payload.new.timer_expires_at).getTime() - new Date().getTime()) / 1000)),
            )
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [draftId, supabase])

  useEffect(() => {
    const channel = supabase
      .channel(`draft_picks_${draftId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "draft_picks",
          filter: `draft_id=eq.${draftId}`,
        },
        () => {
          // Reset the timer when a new pick is made
          if (status === "in_progress" && timerExpiresAt) {
            const newExpiresAt = new Date(Date.now() + draft.draft_pick_timer * 1000).toISOString()
            setTimeRemaining(Math.floor(draft.draft_pick_timer))
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [draftId, status, timerExpiresAt, supabase, draft.draft_pick_timer])

  const colorClass = useMemo(() => {
    if (status === "paused") return "text-red-500"
    if (timeRemaining === null) return "text-muted-foreground"
    const percentage = (timeRemaining / (60 * 2)) * 100 // Assuming 2 minutes per pick
    if (percentage > 66) return "text-green-500"
    if (percentage > 33) return "text-orange-500"
    return "text-red-500"
  }, [timeRemaining, status])

  if (status === "paused") {
    return <div className="text-4xl font-bold text-red-500">PAUSED</div>
  }

  if (timeRemaining === null) {
    return <div className="text-2xl font-bold text-muted-foreground">--:--</div>
  }

  const minutes = Math.floor(timeRemaining / 60)
  const seconds = timeRemaining % 60

  return (
    <div
      className={cn("text-4xl font-bold tabular-nums transition-colors duration-300 pb-1 border-b-2", colorClass, {
        "border-green-500": colorClass === "text-green-500",
        "border-orange-500": colorClass === "text-orange-500",
        "border-red-500": colorClass === "text-red-500",
      })}
    >
      {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
    </div>
  )
}


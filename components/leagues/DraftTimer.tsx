"use client"

import { useEffect, useState } from "react"

interface DraftTimerProps {
  status: "pre_draft" | "in_progress" | "paused" | "completed"
  timerExpiresAt: string | null
  onTimerExpire: () => void
}

export function DraftTimer({ status, timerExpiresAt, onTimerExpire }: DraftTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0)

  useEffect(() => {
    if (!timerExpiresAt) {
      setTimeRemaining(0)
      return
    }

    const updateTimer = () => {
      if (status !== "in_progress") return

      const now = new Date().getTime()
      const expiresAt = new Date(timerExpiresAt).getTime()
      const timeLeft = Math.max(0, expiresAt - now)

      setTimeRemaining(timeLeft)

      if (timeLeft <= 0) {
        clearInterval(intervalId)
        onTimerExpire() // Trigger auto-pick when the timer runs out
      }
    }

    updateTimer() // Run immediately to sync with the latest data
    const intervalId = setInterval(updateTimer, 1000) // Update every second

    return () => clearInterval(intervalId)
  }, [status, timerExpiresAt, onTimerExpire])

  if (timeRemaining <= 0) return <div className="text-red-500 font-bold">Time&apos;s up!</div>

  const minutes = Math.floor(timeRemaining / 60000)
  const seconds = Math.floor((timeRemaining % 60000) / 1000)

  return (
    <div className="text-2xl font-bold">
      {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
    </div>
  )
}

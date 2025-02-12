"use client"

import { useEffect, useState } from "react"

interface DraftTimerProps {
  status: "pre_draft" | "in_progress" | "paused" | "completed"
  timerExpiresAt: string | null
  onTimerExpire: () => void
}

export function DraftTimer({ status, timerExpiresAt, onTimerExpire }: DraftTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)

  useEffect(() => {
    let intervalId: number | null = null

    const updateTimer = () => {
      if (status === "in_progress" && timerExpiresAt) {
        const now = new Date().getTime()
        const expiresAt = new Date(timerExpiresAt).getTime()
        const timeLeft = Math.max(0, expiresAt - now)

        setTimeRemaining(timeLeft)

        if (timeLeft === 0) {
          onTimerExpire()
          if (intervalId) clearInterval(intervalId)
        }
      } else {
        setTimeRemaining(null)
      }
    }

    updateTimer() // Run immediately
    intervalId = window.setInterval(updateTimer, 1000) // Then every second

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [status, timerExpiresAt, onTimerExpire])

  if (timeRemaining === null) return null

  const minutes = Math.floor(timeRemaining / 60000)
  const seconds = Math.floor((timeRemaining % 60000) / 1000)

  return (
    <div className="text-2xl font-bold">
      {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
    </div>
  )
}


"use client"

import { useServerTime } from "@/hooks/useServerTime"
import React, { useEffect, useState } from "react"

interface DraftTimerProps {
  status: "pre_draft" | "in_progress" | "paused" | "completed"
  timerExpiresAt: string | null
  onTimerExpire: () => void
}

const DraftTimer: React.FC<DraftTimerProps> = ({ status, timerExpiresAt, onTimerExpire }) => {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const serverTimeOffset = useServerTime()

  useEffect(() => {
    if (!timerExpiresAt || status !== "in_progress" || serverTimeOffset === null) {
      setTimeRemaining(null)
      return
    }

    let intervalId: NodeJS.Timeout

    const updateTimer = () => {
      const now = Date.now() + serverTimeOffset // Adjusted for server drift
      const expiresAt = new Date(timerExpiresAt).getTime()
      const timeLeft = Math.max(0, expiresAt - now)

      setTimeRemaining(timeLeft)

      if (timeLeft === 0) {
        onTimerExpire()
        clearInterval(intervalId)
      }
    }

    updateTimer()
    intervalId = setInterval(updateTimer, 1000)

    return () => clearInterval(intervalId)
  }, [status, timerExpiresAt, onTimerExpire, serverTimeOffset])

  if (serverTimeOffset === null) return <div>Loading timer...</div>
  if (timeRemaining === null) return null

  const minutes = Math.floor(timeRemaining / 60000)
  const seconds = Math.floor((timeRemaining % 60000) / 1000)

  return (
    <div>
      {minutes}:{seconds < 10 ? "0" : ""}
      {seconds}
    </div>
  )
}

export default DraftTimer

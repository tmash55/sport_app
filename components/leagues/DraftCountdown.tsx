"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock } from "lucide-react"
import { useLeague } from "@/app/context/LeagueContext"
import { cn } from "@/lib/utils"

type TimeUnit = {
  value: number
  label: string
}

export function DraftCountdown() {
  const { leagueData } = useLeague()
  const [timeRemaining, setTimeRemaining] = useState<TimeUnit[] | null>(null)

  useEffect(() => {
    if (!leagueData?.draft_start_time) return

    const updateCountdown = () => {
      const now = new Date()
      const draftTime = new Date(leagueData.draft_start_time)
      const difference = draftTime.getTime() - now.getTime()

      if (difference <= 0) {
        setTimeRemaining(null)
        return
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
      const minutes = Math.floor((difference / 1000 / 60) % 60)
      const seconds = Math.floor((difference / 1000) % 60)

      setTimeRemaining([
        { value: days, label: "Days" },
        { value: hours, label: "Hours" },
        { value: minutes, label: "Minutes" },
        { value: seconds, label: "Seconds" },
      ])
    }

    updateCountdown()
    const intervalId = setInterval(updateCountdown, 1000)

    return () => clearInterval(intervalId)
  }, [leagueData?.draft_start_time])

  if (!leagueData?.draft_start_time) {
    return <div className="text-sm font-medium text-muted-foreground">Draft time not set</div>
  }

  if (!timeRemaining) {
    return <div className="text-sm font-medium text-green-600">Draft has started!</div>
  }

  const draftDate = new Date(leagueData.draft_start_time)

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-center">Draft Countdown</h3>
      <div className="bg-background/80 rounded-lg p-6 shadow-md border border-muted">
        <div className="grid grid-cols-4 gap-4">
          {timeRemaining.map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center">
              <div className="text-4xl font-extrabold tabular-nums bg-muted/30 rounded-md p-3 shadow-inner">
                {value.toString().padStart(2, "0")}
              </div>
              <span className="text-xs font-medium text-muted-foreground mt-2">{label}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            <span>{draftDate.toLocaleDateString()}</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            <span>{draftDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        </div>
      </div>
    </div>
  )
}


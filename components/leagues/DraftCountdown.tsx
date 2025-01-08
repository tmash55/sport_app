"use client"

import { useState, useEffect } from 'react'
import { Calendar, Clock } from 'lucide-react'
import moment from 'moment'

interface DraftCountdownProps {
  draftStartTime: string | null
}

export function DraftCountdown({ draftStartTime }: DraftCountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
  } | null>(null)

  useEffect(() => {
    if (!draftStartTime) return

    const updateCountdown = () => {
      const now = moment()
      const draftTime = moment(draftStartTime).local() // Convert UTC to local time
      const duration = moment.duration(draftTime.diff(now))

      if (duration.asSeconds() <= 0) {
        setTimeRemaining(null)
        return
      }

      setTimeRemaining({
        days: Math.floor(duration.asDays()),
        hours: duration.hours(),
        minutes: duration.minutes(),
        seconds: duration.seconds()
      })
    }

    updateCountdown()
    const intervalId = setInterval(updateCountdown, 1000)

    return () => clearInterval(intervalId)
  }, [draftStartTime])

  if (!draftStartTime) {
    return <div className="text-sm font-medium text-muted-foreground">Draft time not set</div>
  }

  if (!timeRemaining) {
    return <div className="text-sm font-medium text-green-600">Draft has started!</div>
  }

  const draftDate = moment(draftStartTime).local() // Convert UTC to local time

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium">{draftDate.format('MMMM D, YYYY')}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium">{draftDate.format('h:mm A')}</span>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        <div className="flex flex-col items-center">
          <span className="text-3xl font-bold tabular-nums">
            {timeRemaining.days}
          </span>
          <span className="text-xs text-muted-foreground">Days</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-3xl font-bold tabular-nums">
            {timeRemaining.hours.toString().padStart(2, '0')}
          </span>
          <span className="text-xs text-muted-foreground">Hours</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-3xl font-bold tabular-nums">
            {timeRemaining.minutes.toString().padStart(2, '0')}
          </span>
          <span className="text-xs text-muted-foreground">Minutes</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-3xl font-bold tabular-nums">
            {timeRemaining.seconds.toString().padStart(2, '0')}
          </span>
          <span className="text-xs text-muted-foreground">Seconds</span>
        </div>
      </div>
    </div>
  )
}


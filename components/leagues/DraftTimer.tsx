"use client"

import { useState, useEffect } from 'react'
import { createClient } from "@/libs/supabase/client"

interface DraftTimerProps {
  draftId: string
  status: 'pre_draft' | 'in_progress' | 'paused' | 'completed'
  timerExpiresAt: string | null
  onTimerExpire: () => void
}

export function DraftTimer({ draftId, status, timerExpiresAt, onTimerExpire }: DraftTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const calculateTimeRemaining = () => {
      if (status !== 'in_progress' || !timerExpiresAt) {
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
      .channel('drafts')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'drafts',
        filter: `id=eq.${draftId}`
      }, (payload) => {
        if (payload.new.timer_expires_at) {
          setTimeRemaining(Math.max(0, Math.floor((new Date(payload.new.timer_expires_at).getTime() - new Date().getTime()) / 1000)))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [draftId, supabase])

  if (timeRemaining === null) {
    return null
  }

  const minutes = Math.floor(timeRemaining / 60)
  const seconds = timeRemaining % 60

  return (
    <div className="text-2xl font-bold mb-4">
      Time Remaining: {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
    </div>
  )
}


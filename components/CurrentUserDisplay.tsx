'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/libs/supabase/client'

export function CurrentUserDisplay() {
  const [email, setEmail] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setEmail(user?.email || null)
    }
    getUser()
  }, [])

  if (!email) return null

  return (
    <div className="bg-muted text-muted-foreground p-2 text-sm text-center">
      Logged in as: {email}
    </div>
  )
}


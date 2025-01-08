'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/libs/supabase/client'
import { Button } from "@/components/ui/button"

interface LogoutButtonProps {
  returnUrl?: string
}

export function LogoutButton({ returnUrl }: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      await supabase.auth.signOut()
      if (returnUrl) {
        router.push(returnUrl)
      } else {
        router.push('/sign-in')
      }
    } catch (error) {
      console.error('Error logging out:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleLogout} disabled={isLoading}>
      {isLoading ? 'Logging out...' : 'Log out'}
    </Button>
  )
}


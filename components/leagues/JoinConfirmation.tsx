'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { createClient } from '@/libs/supabase/client'

interface JoinConfirmationProps {
  leagueId: string
  leagueName: string
}

export function JoinConfirmation({ leagueId, leagueName }: JoinConfirmationProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [membershipStatus, setMembershipStatus] = useState<'checking' | 'member' | 'not_member' | 'error'>('checking')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkMembershipAndJoin = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          console.error('No authenticated user found')
          setMembershipStatus('error')
          return
        }

        // Fetch user's display_name
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('display_name')
          .eq('id', user.id)
          .single()

        if (userError) {
          console.error('Error fetching user data:', userError)
          setMembershipStatus('error')
          return
        }

        const displayName = userData?.display_name || user.email?.split('@')[0] || 'Unknown'

        // Check if user is already a member
        const { data: existingMember, error: memberError } = await supabase
          .from('league_members')
          .select('id')
          .eq('league_id', leagueId)
          .eq('user_id', user.id)
          .single()

        if (memberError && memberError.code !== 'PGRST116') {
          console.error('Error checking membership:', memberError)
          setMembershipStatus('error')
          return
        }

        if (existingMember) {
          setMembershipStatus('member')
        } else {
          // Join the league
          const { error: joinError } = await supabase
            .from('league_members')
            .insert({ 
              league_id: leagueId, 
              user_id: user.id,
              team_name: displayName
            })

          if (joinError) {
            console.error('Error joining league:', joinError)
            setMembershipStatus('error')
          } else {
            setMembershipStatus('not_member')
          }
        }
      } catch (error) {
        console.error('Unexpected error:', error)
        setMembershipStatus('error')
      }
    }

    checkMembershipAndJoin()
  }, [leagueId, supabase])

  useEffect(() => {
    if (membershipStatus === 'member' || membershipStatus === 'not_member') {
      const timer = setTimeout(() => {
        router.push(`/dashboard/leagues/${leagueId}`)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [membershipStatus, leagueId, router])

  const handleClose = () => {
    setIsOpen(false)
    router.push(`/dashboard/leagues/${leagueId}`)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {membershipStatus === 'member' ? 'Welcome back to' : 'Welcome to'} {leagueName}!
          </DialogTitle>
          <DialogDescription>
            {membershipStatus === 'checking' && 'Checking your membership status...'}
            {membershipStatus === 'member' && 'You are already a member of this league.'}
            {membershipStatus === 'not_member' && 'You have successfully joined the league.'}
            {membershipStatus === 'error' && 'There was an error processing your request.'}
            {membershipStatus !== 'error' && ' You will be redirected to the league page in a few seconds.'}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={handleClose}>Go to League Page</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


'use client'

import { useState } from 'react'
import { createClient } from '@/libs/supabase/client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

interface InviteMembersProps {
  leagueId: string
  onInviteSent: (email: string) => void
}

export function InviteMembers({ leagueId, onInviteSent }: InviteMembersProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Get authenticated user data
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw new Error('Authentication error')

      // Check if the user is already a member of the league
      const { data: existingMember, error: memberCheckError } = await supabase
        .from('league_members')
        .select('users!inner(email)')
        .eq('league_id', leagueId)
        .eq('users.email', email)
        .single()

      if (memberCheckError && memberCheckError.code !== 'PGRST116') {
        throw new Error('Error checking existing member')
      }

      if (existingMember) {
        toast({
          title: "Already a Member",
          description: `${email} is already a member of this league.`,
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Check if an invite already exists
      const { data: existingInvite, error: inviteCheckError } = await supabase
        .from('invites')
        .select('id, created_at')
        .eq('league_id', leagueId)
        .eq('email', email)
        .single()

      if (inviteCheckError && inviteCheckError.code !== 'PGRST116') {
        throw new Error('Error checking existing invite')
      }

      if (existingInvite) {
        toast({
          title: "Invite Already Sent",
          description: `An invitation was already sent to ${email} on ${new Date(existingInvite.created_at).toLocaleDateString()}.`,
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      const response = await fetch(`/api/leagues/${leagueId}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error response:', errorText)
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      toast({
        title: "Invite Sent",
        description: `An invitation has been sent to ${email}`,
      })
      if (data.warning) {
        toast({
          title: "Warning",
          description: data.warning,
          variant: "destructive",
        })
      }
      onInviteSent(email)
      setEmail('')
    } catch (error) {
      console.error('Error sending invite:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send invite. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleInvite} className="flex items-center space-x-2">
      <Input
        type="email"
        placeholder="Enter email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Sending..." : "Invite"}
      </Button>
    </form>
  )
}


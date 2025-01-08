'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/libs/supabase/client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

interface InvitedUserLoginProps {
  inviteToken: string
  invitedEmail: string
  leagueName: string
}

export function InvitedUserLogin({ inviteToken, invitedEmail, leagueName }: InvitedUserLoginProps) {
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: invitedEmail,
        password: password,
      })

      if (error) throw error

      // Fetch the invite details
      const { data: invite, error: inviteError } = await supabase
        .from('invites')
        .select('id, league_id')
        .eq('token', inviteToken)
        .single()

      if (inviteError) throw inviteError

      // Add the user to the league
      const { error: joinError } = await supabase
        .from('league_members')
        .insert({ league_id: invite.league_id, user_id: data.user.id })

      if (joinError) throw joinError

      // Mark the invite as accepted
      const { error: updateInviteError } = await supabase
        .from('invites')
        .update({ accepted_at: new Date().toISOString() })
        .eq('id', invite.id)

      if (updateInviteError) {
        console.error('Error updating invite:', updateInviteError)
        // Continue even if there's an error updating the invite
      }

      toast({
        title: "Login Successful",
        description: `You've successfully joined ${leagueName}!`,
      })

      router.push(`/dashboard/leagues/${invite.league_id}`)
    } catch (error) {
      console.error('Error during login:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Join {leagueName}</CardTitle>
        <CardDescription>Log in to accept your invitation</CardDescription>
      </CardHeader>
      <form onSubmit={handleLogin}>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={invitedEmail} disabled />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Log In & Join League"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}


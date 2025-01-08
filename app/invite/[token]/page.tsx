import { createClient } from "@/libs/supabase/server"
import { redirect } from 'next/navigation'
import { JoinConfirmation } from "@/components/leagues/JoinConfirmation"
import { CurrentUserDisplay } from "@/components/CurrentUserDisplay"
import { LogoutButton } from "@/components/LogoutButton"
import { InvitedUserSignUp } from "@/components/InvitedUserSignUp"
import { InvitedUserLogin } from "@/components/InviteUserLogin"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default async function InvitePage({ params }: { params: { token: string } }) {
  const supabase = createClient()

  // Fetch and validate the invite
  const { data: invite, error: inviteError } = await supabase
    .from('invites')
    .select('id, league_id, email, accepted_at, expires_at, leagues(id, name)')
    .eq('token', params.token)
    .single()

  if (inviteError || !invite) {
    console.error('Error fetching invite:', inviteError)
    return (
      <InvitePageWrapper>
        <div className="p-4 text-center">Invalid or expired invite.</div>
      </InvitePageWrapper>
    )
  }

  console.log('Fetched invite:', invite)

  if (invite.accepted_at) {
    console.log('Invite already accepted at:', invite.accepted_at)
    return (
      <InvitePageWrapper>
        <div className="p-4 text-center">This invite has already been accepted.</div>
      </InvitePageWrapper>
    )
  }

  if (new Date(invite.expires_at) < new Date()) {
    console.log('Invite expired at:', invite.expires_at)
    return (
      <InvitePageWrapper>
        <div className="p-4 text-center">This invite has expired.</div>
      </InvitePageWrapper>
    )
  }

  // Get authenticated user data
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (!user) {
    // Check if a user with this email already exists
    const { data: existingUser, error: existingUserError } = await supabase
      .from('users')
      .select('id')
      .eq('email', invite.email)
      .single()

    if (existingUserError && existingUserError.code !== 'PGRST116') {
      console.error('Error checking existing user:', existingUserError)
    }

    if (existingUser) {
      // User exists but is not logged in, show login form
      return (
        <InvitePageWrapper>
          <InvitedUserLogin 
            inviteToken={params.token}
            invitedEmail={invite.email}
            leagueName={invite.leagues.name}
          />
        </InvitePageWrapper>
      )
    } else {
      // User doesn't exist, show sign-up form
      return (
        <InvitePageWrapper>
          <InvitedUserSignUp 
            inviteToken={params.token}
            invitedEmail={invite.email}
            leagueName={invite.leagues.name}
          />
        </InvitePageWrapper>
      )
    }
  }

  console.log('Authenticated user:', user.id, user.email)

  if (invite.email.toLowerCase() !== user.email.toLowerCase()) {
    console.error('Invite email mismatch:', invite.email, user.email)
    return (
      <InvitePageWrapper>
        <Card>
          <CardHeader>
            <CardTitle>Email Mismatch</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This invite is for {invite.email}. You are currently logged in with {user.email}.</p>
            <p>Please log out and sign in with the correct account to accept this invite.</p>
          </CardContent>
          <CardFooter>
            <LogoutButton returnUrl={`/invite/${params.token}`} />
          </CardFooter>
        </Card>
      </InvitePageWrapper>
    )
  }

  // Check if the user is already a member of the league
  const { data: existingMember, error: memberCheckError } = await supabase
    .from('league_members')
    .select('id')
    .eq('league_id', invite.league_id)
    .eq('user_id', user.id)
    .single()

  if (memberCheckError && memberCheckError.code !== 'PGRST116') {
    console.error('Error checking league membership:', memberCheckError)
    return (
      <InvitePageWrapper>
        <div className="p-4 text-center">Error checking league membership. Please try again.</div>
      </InvitePageWrapper>
    )
  }

  if (existingMember) {
    console.log('User already a member:', existingMember)
    return (
      <InvitePageWrapper>
        <div className="p-4 text-center">You are already a member of this league.</div>
      </InvitePageWrapper>
    )
  }

  console.log('User not yet a member, proceeding with join')

  // Add the user to the league
  const { error: joinError } = await supabase
    .from('league_members')
    .insert({ league_id: invite.league_id, user_id: user.id })

  if (joinError) {
    console.error('Error joining league:', joinError)
    return (
      <InvitePageWrapper>
        <div className="p-4 text-center">Error joining league. Please try again.</div>
      </InvitePageWrapper>
    )
  }

  console.log('User successfully added to league')

  // Mark the invite as accepted
  const { error: updateInviteError } = await supabase
    .from('invites')
    .update({ accepted_at: new Date().toISOString() })
    .eq('id', invite.id)

  if (updateInviteError) {
    console.error('Error updating invite:', updateInviteError)
    // Even if there's an error updating the invite, the user has still joined the league
  } else {
    console.log('Invite marked as accepted')
  }

  // Show the join confirmation dialog
  return (
    <InvitePageWrapper>
      <JoinConfirmation leagueId={invite.league_id} leagueName={invite.leagues.name} />
    </InvitePageWrapper>
  )
}

function InvitePageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col items-center justify-center">
      <CurrentUserDisplay />
      <div className="mt-8 w-full max-w-md">
        {children}
      </div>
    </div>
  )
}


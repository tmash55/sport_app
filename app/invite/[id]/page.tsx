import { createClient } from "@/libs/supabase/server"
import { JoinConfirmation } from "@/components/leagues/JoinConfirmation"
import { CurrentUserDisplay } from "@/components/CurrentUserDisplay"
import { InvitePageAuth } from "@/components/InvitedPageAuth"

export default async function InvitePage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  // Fetch league details
  const { data: league, error: leagueError } = await supabase
    .from('leagues')
    .select('id, name')
    .eq('id', params.id)
    .single()

  if (leagueError || !league) {
    console.error('Error fetching league:', leagueError)
    return (
      <InvitePageWrapper>
        <div className="p-4 text-center">Invalid league invite.</div>
      </InvitePageWrapper>
    )
  }

  // Get authenticated user data
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // User is not logged in, show auth options
    return (
      <InvitePageWrapper>
        <InvitePageAuth leagueId={params.id} leagueName={league.name} />
      </InvitePageWrapper>
    )
  }

  // User is logged in, show JoinConfirmation
  return (
    <InvitePageWrapper>
      <JoinConfirmation leagueId={league.id} leagueName={league.name} />
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


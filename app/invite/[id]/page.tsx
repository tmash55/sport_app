import { createClient } from "@/libs/supabase/server"
import { JoinConfirmation } from "@/components/leagues/JoinConfirmation"
import { CurrentUserDisplay } from "@/components/CurrentUserDisplay"
import { InvitePageAuth } from "@/components/InvitedPageAuth"
import type React from "react"

// Define the correct type for the league data
interface League {
  id: string
  name: string
  contest_id: string
  contests: {
    id: string
    name: string
  }
}

export default async function InvitePage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  // Updated query to fetch contest information
  const { data, error: leagueError } = await supabase
    .from("leagues")
    .select("id, name, contest_id, contests(id, name)")
    .eq("id", params.id)
    .single()

  // Cast the data to the correct type
  const league = data as unknown as League | null

  if (leagueError || !league) {
    console.error("Error fetching league:", leagueError)
    return (
      <InvitePageWrapper>
        <div className="p-4 text-center">Invalid league invite.</div>
      </InvitePageWrapper>
    )
  }

  // Get authenticated user data
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    // User is not logged in, show auth options
    return (
      <InvitePageWrapper>
        <InvitePageAuth leagueId={params.id} leagueName={league.name} />
      </InvitePageWrapper>
    )
  }

  // Access the contest name directly since we've defined the correct type
  const contestName = league.contests?.name || "Unknown Contest"
  const contestId = league.contest_id

  // User is logged in, show JoinConfirmation with contest information
  return (
    <InvitePageWrapper>
      <JoinConfirmation
        leagueId={league.id}
        leagueName={league.name}
        contestName={contestName}
        contestId={contestId}
      />
    </InvitePageWrapper>
  )
}

function InvitePageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col items-center justify-center">
      <CurrentUserDisplay />
      <div className="mt-8 w-full max-w-md">{children}</div>
    </div>
  )
}


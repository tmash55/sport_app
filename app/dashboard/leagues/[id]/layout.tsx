import { Suspense } from "react"
import { redirect, notFound } from "next/navigation"
import { Settings } from "lucide-react"
import { createClient } from "@/libs/supabase/server"
import { LeagueProvider } from "@/app/context/LeagueContext"
import { LeagueHeader } from "@/components/leagues/LeagueHeader"
import { LeagueSettingsDialog } from "@/components/leagues/LeagueSettingsDialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"
import { LeagueNavigation } from "@/components/leagues/league-navigation"

export default async function LeagueLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { id: string }
}) {
  const supabase = createClient()

  const { data: userResponse, error: userError } = await supabase.auth.getUser()
  if (userError || !userResponse.user) {
    console.error("Error fetching user:", userError)
    redirect("/sign-in")
  }

  const { data: leagueData, error: leagueError } = await supabase
    .from("leagues")
    .select(
      `
      id,
      name,
      commissioner_id,
      league_members(user_id)
    `,
    )
    .eq("id", params.id)
    .single()

  if (leagueError || !leagueData) {
    console.error("Error fetching league:", leagueError)
    notFound()
  }

  const isLeagueMember = leagueData.league_members.some(
    (member: { user_id: string }) => member.user_id === userResponse.user.id,
  )
  const isCommissioner = leagueData.commissioner_id === userResponse.user.id

  if (!isLeagueMember && !isCommissioner) {
    return (
      <div className="space-y-6 p-4">
        <Alert variant="destructive">
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You are not a member of this league. You need to be a member to view this content.
          </AlertDescription>
          <Button asChild className="mt-4 w-full sm:w-auto">
            <Link href="/dashboard/my-pools">Return to Dashboard</Link>
          </Button>
        </Alert>
      </div>
    )
  }

  return (
    <LeagueProvider leagueId={params.id}>
      <div className="flex flex-col min-h-[calc(100vh-5rem)]">
        <div className="flex-grow overflow-y-auto">
          <div className="container max-w-7xl mx-auto px-4 py-6 space-y-6">
            <LeagueHeader />
            <LeagueNavigation leagueId={params.id} />
            <main>{children}</main>
          </div>
        </div>

        {/* Settings Button - Floating */}
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-10">
          <LeagueSettingsDialog leagueId={params.id} isCommissioner={isCommissioner}>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 sm:h-12 sm:w-12 rounded-full shadow-lg hover:shadow-xl transition-all bg-background"
            >
              <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </LeagueSettingsDialog>
        </div>
      </div>
    </LeagueProvider>
  )
}


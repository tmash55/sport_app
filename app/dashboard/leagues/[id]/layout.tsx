import { Suspense } from 'react'
import { notFound, redirect } from 'next/navigation'
import { createClient } from "@/libs/supabase/server"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { LeagueHeader } from '@/components/leagues/LeagueHeader'
import { LeagueSettingsDialog } from "@/components/leagues/LeagueSettingsDialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Settings } from 'lucide-react'
import Link from 'next/link'

export default async function LeagueLayout({ 
  children, 
  params 
}: { 
  children: React.ReactNode
  params: { id: string }
}) {
  const supabase = createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError) {
    console.error("Error fetching user:", userError)
    redirect('/login')
  }

  const { data: league, error: leagueError } = await supabase
    .from("leagues")
    .select("*")
    .eq("id", params.id)
    .single()

  if (leagueError || !league) {
    console.error("Error fetching league:", leagueError)
    notFound()
  }

  // Check if the user is a member of the league
  const { data: leagueMember, error: membershipError } = await supabase
    .from('league_members')
    .select('id')
    .eq('league_id', params.id)
    .eq('user_id', user.id)
    .single()

  if (membershipError) {
    console.error("Error checking league membership:", membershipError)
  }

  const isLeagueMember = !!leagueMember
  const isCommissioner = league.commissioner_id === user.id

  if (!isLeagueMember && !isCommissioner) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You are not a member of this league. You need to be a member to view this content.
          </AlertDescription>
          <Button asChild className="mt-4">
            <Link href="/dashboard">Return to Dashboard</Link>
          </Button>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{league.name}</h1>
        <LeagueSettingsDialog leagueId={params.id} isCommissioner={isCommissioner}>
          <Button variant="ghost" size="icon">
            <Settings className="h-6 w-6" />
          </Button>
        </LeagueSettingsDialog>
      </div>
      <Suspense fallback={<Skeleton className="h-[100px] w-full" />}>
        <LeagueHeader leagueId={params.id} />
      </Suspense>
      <Tabs defaultValue="draft">
        <TabsList>
          <TabsTrigger value="draft" asChild>
            <Link href={`/dashboard/leagues/${params.id}`}>Draft</Link>
          </TabsTrigger>
          <TabsTrigger value="team" asChild>
            <Link href={`/dashboard/leagues/${params.id}/team`}>Team</Link>
          </TabsTrigger>
          <TabsTrigger value="standings" asChild>
            <Link href={`/dashboard/leagues/${params.id}/standings`}>Standings</Link>
          </TabsTrigger>
          <TabsTrigger value="league" asChild>
            <Link href={`/dashboard/leagues/${params.id}/overview`}>League</Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      {children}
    </div>
  )
}


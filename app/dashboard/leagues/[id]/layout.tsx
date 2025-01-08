import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { createClient } from "@/libs/supabase/server"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { LeagueHeader } from '@/components/leagues/LeagueHeader'
import { LeagueSettingsDialog } from "@/components/leagues/LeagueSettingsDialog"
import { Button } from "@/components/ui/button"


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
    notFound()
  }

  const { data: league, error } = await supabase
    .from("leagues")
    .select("*")
    .eq("id", params.id)
    .single()

  if (error || !league) {
    console.error("Error fetching league:", error)
    notFound()
  }

  const isCommissioner = league.commissioner_id === user.id

  return (
    <div className="space-y-6">
     <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{league.name}</h1>
        <LeagueSettingsDialog leagueId={params.id} isCommissioner={league.commissioner_id === user.id}>
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


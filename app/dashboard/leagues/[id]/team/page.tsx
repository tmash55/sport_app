import { Suspense } from 'react'
import { LeagueTeam } from "@/components/leagues/LeagueTeam"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/libs/supabase/server"

export default async function LeagueTeamPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
      <LeagueTeam leagueId={params.id} userId={user.id} />
    </Suspense>
  )
}


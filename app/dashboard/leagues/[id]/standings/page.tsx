import { Suspense } from 'react'
import { LeagueStandings } from "@/components/leagues/LeagueStandings"
import { Skeleton } from "@/components/ui/skeleton"

export default function LeagueStandingsPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
      <LeagueStandings leagueId={params.id} />
    </Suspense>
  )
}


import { Suspense } from 'react'
import { LeagueOverview } from "@/components/leagues/LeagueOverview"
import { Skeleton } from "@/components/ui/skeleton"

export default function LeagueOverviewPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
      <LeagueOverview/>
    </Suspense>
  )
}


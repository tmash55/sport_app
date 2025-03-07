import { Suspense } from 'react'
import { LeagueOverview } from "@/components/leagues/LeagueOverview"
import { Skeleton } from "@/components/ui/skeleton"
import { LeagueHeader } from '@/components/leagues/LeagueHeader'

export default function LeagueOverviewPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
      <LeagueHeader />
      <LeagueOverview />
    </Suspense>
  )
}


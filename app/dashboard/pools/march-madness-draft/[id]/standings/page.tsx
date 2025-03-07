"use client"

import { Suspense } from "react"
import { LeagueStandings } from "@/components/leagues/LeagueStandings"
import { Skeleton } from "@/components/ui/skeleton"
export default function LeagueStandingsPage() {

  return (
    <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
      <LeagueStandings />
    </Suspense>
  )
}


"use client"

import { Suspense } from "react"
import { LeagueTeam } from "@/components/leagues/LeagueTeam"
import { Skeleton } from "@/components/ui/skeleton"

export default function LeagueTeamPage() {
  return (
    <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
      <LeagueTeam />
    </Suspense>
  )
}


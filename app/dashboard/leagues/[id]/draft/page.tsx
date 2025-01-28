"use client"

import { Suspense } from "react"
import { LeagueDraft } from "@/components/leagues/LeagueDraft"
import { Skeleton } from "@/components/ui/skeleton"
import { useLeague } from "@/app/context/LeagueContext"
import { LeagueHeader } from "@/components/leagues/LeagueHeader"

export default function LeagueDraftPage() {
  return (
    <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
      <LeagueHeader />
      <LeagueDraft />
    </Suspense>
  )
}


"use client"

import { Suspense } from "react"
import { LeagueDraft } from "@/components/leagues/LeagueDraft"
import { Skeleton } from "@/components/ui/skeleton"
import { useLeague } from "@/app/context/LeagueContext"

export default function LeagueDraftPage() {
  return (
    <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
      <LeagueDraft />
    </Suspense>
  )
}


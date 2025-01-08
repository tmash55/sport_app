import { Suspense } from 'react'
import { LeagueDraft } from "@/components/leagues/LeagueDraft"
import { Skeleton } from "@/components/ui/skeleton"

export default function LeagueDraftPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
       <LeagueDraft leagueId={params.id} />
    </Suspense>
  )
}


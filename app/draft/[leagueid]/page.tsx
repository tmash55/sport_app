import React from 'react'
import { DraftRoom } from "@/components/leagues/DraftRoom"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from 'lucide-react'

export default function DraftRoomPage({ params }: { params: { leagueid: string } }) {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 bg-background">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/dashboard/leagues/${params.leagueid}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to League
          </Link>
        </Button>
      </div>
      <div className="flex-grow">
        <DraftRoom leagueId={params.leagueid} isCommissioner={false} currentUser={null} maxTeams={0} />
      </div>
    </div>
  )
}


import React from 'react'

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from 'lucide-react'
import { DraftRoom } from '@/components/leagues/DraftRoom'


export default function DraftRoomPage({ params }: { params: { leagueid: string } }) {
  return (
      <div>
        <DraftRoom leagueId={params.leagueid} />
      </div>
  )
}

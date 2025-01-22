"use client"

import { JoinLinkGenerator } from "./JoinLinkGenerator"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

interface InviteMembersProps {
  leagueId: string
}

export function InviteMembers({ leagueId }: InviteMembersProps) {
  return (
    <Card className="bg-muted/30">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Invite Members to Your League</CardTitle>
      </CardHeader>
      <CardContent>
        <JoinLinkGenerator leagueId={leagueId} />
      </CardContent>
    </Card>
  )
}


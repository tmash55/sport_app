'use client'

import { JoinLinkGenerator } from "./JoinLinkGenerator"

interface InviteMembersProps {
  leagueId: string
}

export function InviteMembers({ leagueId }: InviteMembersProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium mb-2">Invite members by sharing this link:</h3>
      <JoinLinkGenerator leagueId={leagueId} />
    </div>
  )
}


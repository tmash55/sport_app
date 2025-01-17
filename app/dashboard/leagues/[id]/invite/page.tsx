
import { InviteMembers } from "@/components/leagues/InviteMembers"

export default function InviteFriendsPage({ params }: { params: { leagueId: string } }) {
  return (
    <div className="container mx-auto py-8">
      <InviteMembers leagueId={params.leagueId} />
    </div>
  )
}


import { createClient } from '@/libs/supabase/server'
import { InviteMembers } from '@/components/InviteMembers'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/PageHeader'
import { InviteMembers2 } from '@/components/leagues/InviteMembers2'

export const dynamic = 'force-dynamic'

export default async function InvitePage({ params }: { params: { leagueId: string } }) {
  const supabase = createClient()

  const { data: league, error } = await supabase
    .from('leagues')
    .select('*, league_members!inner(*)')
    .eq('id', params.leagueId)
    .single()

  if (error || !league) {
    redirect('/dashboard')
  }

  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session?.user || !league.league_members.some(member => 
    member.user_id === session.user.id && 
    (member.role === 'commissioner' || member.role === 'member')
  )) {
    redirect('/dashboard')
  }

  return (
    <div className="container max-w-4xl mx-auto py-4">
      <PageHeader
        title="Invite League Members"
        subtitle={`Get your friends together for ${league.name}`}
        currentStep={3}
        completedSteps={[1, 2]} // Both contest selection and league details are completed
        steps={["Select Contest", "League Details", "Invite Friends"]}
        showBackButton={true}
      />
      <InviteMembers2
        leagueId={params.leagueId} 
        leagueName={league.name} 
      />
    </div>
  )
}


import { notFound } from 'next/navigation'
import { PoolDetailsForm } from '@/components/PoolDetailsForm'
import { createClient } from '@/libs/supabase/server'
import { PageHeader } from '@/components/PageHeader'

export const dynamic = 'force-dynamic'

export default async function ContestDetailsPage({ params }: { params: { contestId: string } }) {
  const supabase = createClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  const isAuthenticated = !!session
  
  const { data: contest, error } = await supabase
    .from('contests')
    .select('*')
    .eq('id', params.contestId)
    .single()

  if (error || !contest) {
    console.error('Error fetching contest:', error)
    notFound()
  }

  return (
    <div className="container max-w-4xl mx-auto py-4">
      <PageHeader
        title={`Create Your ${contest.name} League`}
        subtitle="Set up your league details and invite friends to join the competition"
        currentStep={2}
        completedSteps={[1]} // Contest selection is completed
        steps={["Select Contest", "League Details", "Invite Friends"]}
        showBackButton={isAuthenticated}
      />

      <PoolDetailsForm contestId={contest.id} contestName={contest.name} />
    </div>
  )
}


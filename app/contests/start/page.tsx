import { createClient } from '@/libs/supabase/server'
import { ContestCard } from '@/components/ContestCard'
import { PageHeader } from '@/components/PageHeader'

export const dynamic = 'force-dynamic'

export default async function ContestSelection() {
  const supabase = createClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  const isAuthenticated = !!session

  const { data: contests, error } = await supabase
    .from('contests')
    .select('*')

  if (error) {
    console.error('Error fetching contests:', error)
    return <div>Error loading contests. Please try again later.</div>
  }

  if (!contests || contests.length === 0) {
    return <div>No contests available at the moment.</div>
  }

  return (
    <div className="container max-w-4xl mx-auto py-4">
      <PageHeader
        title="Select a Contest"
        subtitle="Choose the contest you want to create a league for"
        currentStep={1}
        completedSteps={[]} // No steps completed yet
        steps={["Select Contest", "League Details", "Invite Friends"]}
        showBackButton={isAuthenticated}
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {contests.map((contest) => (
          <ContestCard key={contest.id} contest={contest} />
        ))}
      </div>
    </div>
  )
}


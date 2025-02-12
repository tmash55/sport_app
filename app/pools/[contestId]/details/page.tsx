import { notFound } from "next/navigation"
import { PoolDetailsForm } from "@/components/PoolDetailsForm"
import { createClient } from "@/libs/supabase/server"
import { PageHeader } from "@/components/PageHeader"

export const dynamic = "force-dynamic"

export default async function ContestDetailsPage({ params }: { params: { contestId: string } }) {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()
  const isAuthenticated = !!session

  const { data: contest, error } = await supabase.from("contests").select("*").eq("id", params.contestId).single()

  if (error || !contest) {
    console.error("Error fetching contest:", error)
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <PageHeader
          title={`Create Your ${contest.name} Pool`}
          subtitle="Set up your pool details and invite friends to join the competition"
          currentStep={2}
          completedSteps={[1]}
          steps={["Select Pool", "Pool Details", "Invite Friends"]}
          showBackButton={isAuthenticated}
          currentPage="details"
        />

        <div className="mt-8">
          <PoolDetailsForm contestId={contest.id} contestName={contest.name} />
        </div>
      </div>
    </div>
  )
}


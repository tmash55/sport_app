import { createClient } from "@/libs/supabase/server"
import { ContestCard } from "@/components/ContestCard"
import { PageHeader } from "@/components/PageHeader"

export const dynamic = "force-dynamic"

export default async function ContestSelection() {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()
  const isAuthenticated = !!session

  const { data: contests, error } = await supabase.from("contests").select("*")

  if (error) {
    console.error("Error fetching contests:", error)
    return <div>Error loading contests. Please try again later.</div>
  }

  if (!contests || contests.length === 0) {
    return <div>No pools available at the moment.</div>
  }

  // Sort contests: active first, then by name
  const sortedContests = contests.sort((a, b) => {
    if (a.status === "active" && b.status !== "active") return -1
    if (a.status !== "active" && b.status === "active") return 1
    return a.name.localeCompare(b.name)
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <PageHeader
          title="Select a Pool"
          subtitle="Choose the pool you want to create a pool for"
          currentStep={1}
          completedSteps={[]}
          steps={["Select Pool", "Pool Details", "Invite Friends"]}
          showBackButton={isAuthenticated}
          currentPage="start"
        />

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedContests.map((contest) => (
            <ContestCard key={contest.id} contest={contest} />
          ))}
        </div>
      </div>
    </div>
  )
}


import type React from "react"
import { redirect, notFound } from "next/navigation"
import { Settings } from "lucide-react"
import { createClient } from "@/libs/supabase/server"
import { LeagueProvider } from "@/app/context/LeagueContext"
import { LeagueSettingsDialog } from "@/components/leagues/LeagueSettingsDialog"
import { Button } from "@/components/ui/button"
import { LeagueNavigation } from "@/components/leagues/league-navigation"
import { ScrollToTopLayout } from "@/components/ScrollToTopLayout"
import { CommissionerPaymentPrompt } from "@/components/leagues/CommissionerPaymentPrompt"
import { LeagueLockedMessage } from "@/components/leagues/LeagueLockedMessage"

type LeagueDataType = {
  id: string
  name: string
  commissioner_id: string
  payment_status: string
  drafts?: { status: string } | null
  league_members: { user_id: string | null }[]
}

export default async function LeagueLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { id: string }
}) {
  const supabase = createClient()
  

  const { data: userResponse, error: userError } = await supabase.auth.getUser()
  if (userError || !userResponse.user) {
    console.error("Error fetching user:", userError)
    redirect("/sign-in")
  }

  const { data: leagueData, error: leagueError } = await supabase
    .from("leagues")
    .select(
      `
      id,
      name,
      commissioner_id,
      payment_status,
      drafts: drafts(status),
      league_members(user_id)
    `,
    )
    .eq("id", params.id)
    .single() as unknown as { data: LeagueDataType | null, error: any }

  if (leagueError || !leagueData) {
    console.error("Error fetching league:", leagueError)
    notFound()
  }

  console.log("Fetched leagueData:", JSON.stringify(leagueData, null, 2))

  const isLeagueMember = leagueData.league_members.some(
    (member: { user_id: string }) => member.user_id === userResponse.user.id,
  )
  const isCommissioner = leagueData.commissioner_id === userResponse.user.id

  if (!isLeagueMember && !isCommissioner) {
    return <LeagueLockedMessage />
  }

  const draftStatus = leagueData.drafts.status || "pre_draft"
  console.log("Draft Status:", draftStatus, "Raw drafts data:", leagueData.drafts.status)
  const isPaymentRequired = draftStatus === "completed" && leagueData.payment_status !== "paid"
  console.log("Is Payment Required:", isPaymentRequired)

  // If payment is required, block access for non-commissioners
  if (isPaymentRequired && !isCommissioner) {
    return <LeagueLockedMessage />
  }

  // If payment is required for commissioner, show payment prompt
  if (isPaymentRequired && isCommissioner) {
    return (
      <ScrollToTopLayout>
        <LeagueProvider leagueId={params.id}>
          <div className="flex flex-col min-h-[calc(100vh-5rem)]">
            <div className="flex-grow overflow-y-auto">
              <div className="container max-w-7xl mx-auto px-4 py-6 space-y-6 border border-r-1 rounded-2xl">
                <CommissionerPaymentPrompt leagueId={params.id} leagueName={leagueData.name} />
              </div>
            </div>
          </div>
        </LeagueProvider>
      </ScrollToTopLayout>
    )
  }

  // Regular layout for paid leagues or leagues in draft
  return (
    <ScrollToTopLayout>
      <LeagueProvider leagueId={params.id}>
        <div className="flex flex-col min-h-[calc(100vh-5rem)]">
          <div className="flex-grow overflow-y-auto">
            <div className="container max-w-7xl mx-auto px-4 py-6 space-y-6 border border-r-1 rounded-2xl">
              <LeagueNavigation />
              <main>{children}</main>
            </div>
          </div>

          {/* Settings Button - Floating */}
          <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-10">
            <LeagueSettingsDialog leagueId={params.id} isCommissioner={isCommissioner}>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 sm:h-12 sm:w-12 rounded-full shadow-lg hover:shadow-xl transition-all bg-background"
              >
                <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </LeagueSettingsDialog>
          </div>
        </div>
      </LeagueProvider>
    </ScrollToTopLayout>
  )
}


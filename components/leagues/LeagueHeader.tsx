"use client"
import { getPriceIndexForUser, getUserPaidLeagues } from "@/utils/paymentHelper"
import { useEffect, useState } from "react"
import { useLeague } from "@/app/context/LeagueContext"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { DraftTimeModal } from "./DraftTimeModal"
import { DraftCountdown } from "./DraftCountdown"
import { InviteMembers } from "./InviteMembers"
import { DraftOrderManager } from "./DraftOrderManager"
import { CommissionerGuide } from "./CommissionerGuide"
import Link from "next/link"
import {
  Trophy,
  Users,
  ArrowRight,
  Clock,
  AlertTriangle,
  ShieldCheck,
  LockIcon,
  CheckCircle,
  Play,
  Timer,
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { EnergizedButton } from "../ui/energized-button"
import ButtonCheckout from "../ButtonCheckout"
import config from "@/config"
import { Badge } from "../ui/badge"
import { cn } from "@/lib/utils"

const LeagueHeaderSkeleton = () => (
  <Card className="mb-4 sm:mb-6">
    <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-3">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-12 w-24" />
      </div>
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </CardContent>
  </Card>
)

// Add this new component for the draft instructions with a more compact layout
function DraftInstructions({ isCommissioner, isDraftOrderSet }: { isCommissioner: boolean; isDraftOrderSet: boolean }) {
  return (
    <div className="bg-card border rounded-lg p-3 sm:p-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="h-5 w-5 text-orange-500" />
        <h3 className="font-semibold text-base sm:text-lg">Important Draft Information</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="flex items-center gap-2 p-2 bg-background rounded-md">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-full flex-shrink-0">
            <Clock className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm">Draft Room Opens</p>
            <p className="text-xs text-muted-foreground truncate">After Selection Sunday (March 16th)</p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 bg-background rounded-md">
          <div className="bg-green-100 dark:bg-green-900/30 p-1.5 rounded-full flex-shrink-0">
            <Timer className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm">Draft Timer</p>
            <p className="text-xs text-muted-foreground truncate">Auto-pick if time expires</p>
          </div>
        </div>

        {isCommissioner && (
          <>
            <div className="flex items-center gap-2 p-2 bg-background rounded-md">
              <div
                className={`p-1.5 rounded-full flex-shrink-0 ${isDraftOrderSet ? "bg-green-100 dark:bg-green-900/30" : "bg-amber-100 dark:bg-amber-900/30"}`}
              >
                <CheckCircle
                  className={`h-3.5 w-3.5 ${isDraftOrderSet ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}`}
                />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm">Set Draft Order</p>
                <p className="text-xs text-muted-foreground truncate">
                  {isDraftOrderSet ? "Order set" : "Required to begin"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 bg-background rounded-md">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-1.5 rounded-full flex-shrink-0">
                <Play className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm">Commissioner Starts</p>
                <p className="text-xs text-muted-foreground truncate">Only you can start the draft</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export function LeagueHeader() {
  const { leagueData, isLoading, error } = useLeague()
  const [priceIndex, setPriceIndex] = useState(0)

  useEffect(() => {
    if (leagueData && leagueData.user_id) {
      const fetchPriceIndex = async () => {
        try {
          const paidLeagues = await getUserPaidLeagues(leagueData.user_id, leagueData.contests.id)
          const newPriceIndex = getPriceIndexForUser(paidLeagues)
          setPriceIndex(newPriceIndex)
        } catch (err) {
          console.error("Error fetching price index:", err)
        }
      }
      fetchPriceIndex()
    }
  }, [leagueData])
  if (isLoading) return <LeagueHeaderSkeleton />

  if (error || !leagueData) {
    return (
      <Card className="mb-4 sm:mb-6">
        <CardContent className="p-4 text-destructive">
          Error loading league data: {error?.message || "Unknown error"}
        </CardContent>
      </Card>
    )
  }

  const { id: leagueId, name, contests, league_members, drafts, user_id, payment_status, league_settings } = leagueData

  const userLeagueRole = league_members.find((member: any) => member.user_id === user_id)?.role

  const isCommissioner = userLeagueRole === "commissioner"

  const isLeagueFull = league_members.every((member: any) => member.user_id !== null)
  const needsPayment = isCommissioner && payment_status !== "paid"
  const isDraftCompleted = drafts.status === "completed"
  const maxTeams = league_settings[0].max_teams

  const isDraftOrderSet = drafts.draft_order && drafts.draft_order.length > 0

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-background to-muted/50 backdrop-blur border shadow-md">
      <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">{name}</h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center gap-1 sm:gap-2">
                <Trophy className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                <span className="font-medium">{contests.sport.toUpperCase()}</span>
              </div>
              <Separator orientation="vertical" className="h-3 sm:h-4" />
              <div className="flex items-center gap-1 sm:gap-2">
                <Users className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                <span className="font-medium">{maxTeams} Members</span>
              </div>
              <Separator orientation="vertical" className="h-3 sm:h-4" />
              <div className="flex items-center gap-1 sm:gap-2">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                <span className="font-medium">
                  Draft{" "}
                  {drafts.status === "pre_draft"
                    ? "Pre Draft"
                    : drafts.status === "in_progress"
                      ? "In Progress"
                      : drafts.status === "completed"
                        ? "Completed"
                        : drafts.status === "paused"
                          ? "Paused"
                          : "Unknown"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 sm:mt-0">
            {isCommissioner && drafts.status === "pre_draft" && (
              <>
                <DraftOrderManager leagueId={leagueId} maxTeams={maxTeams} onOrderUpdated={() => {}} />
                <DraftTimeModal />
              </>
            )}
            {isCommissioner && <CommissionerGuide />}
          </div>
        </div>

        {(drafts.status === "pre_draft" || drafts.status === "in_progress" || drafts.status === "paused") && (
          <div className="space-y-4 sm:space-y-6">
            {drafts.status === "pre_draft" && (
              <>
                <DraftInstructions isCommissioner={isCommissioner} isDraftOrderSet={isDraftOrderSet} />
                <DraftCountdown />
              </>
            )}
            {drafts.status !== "completed" && (
              <EnergizedButton asChild size="lg" className="w-full">
                <Link href={`/draft/${leagueId}`} className="flex items-center justify-center py-2 sm:py-3">
                  <span className="relative z-10">Go to Draft Room</span>
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-1 relative z-10" />
                </Link>
              </EnergizedButton>
            )}
            {!isLeagueFull && isCommissioner && (
              <>
                <Separator className="my-4 sm:my-6" />
                <InviteMembers leagueId={leagueId} />
              </>
            )}

            {needsPayment && (
              <Card className="overflow-hidden">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 sm:p-6">
                  <div className="flex items-center gap-3 text-white">
                    <Trophy className="h-6 w-6" />
                    <div>
                      <h3 className="font-bold text-lg sm:text-xl">Don&apos;t miss the action!</h3>
                      <p className="text-blue-100 text-sm mt-1">
                        Draft now for free – Upgrade to track standings & win your pool!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="p-4 sm:p-6 space-y-6">
                  {/* Warning Box */}
                  <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800/50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-amber-100 dark:bg-amber-800 rounded-full p-2">
                        <LockIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-amber-800 dark:text-amber-300 mb-1">Without Activation:</h4>
                        <ul className="space-y-1">
                          <li className="flex items-center text-amber-700 dark:text-amber-400 text-sm">
                            <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
                            No access to standings
                          </li>
                          <li className="flex items-center text-amber-700 dark:text-amber-400 text-sm">
                            <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
                            No scoring updates after draft
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Price Box */}
                  <div className="flex flex-col items-center space-y-6">
                    <div className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 w-full max-w-sm border border-gray-200 dark:border-gray-700 shadow-sm">
                      <div className="text-center space-y-2">
                        <Badge variant="secondary" className="mb-2">
                          ONE-TIME PAYMENT
                        </Badge>
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-3xl sm:text-4xl font-bold">
                            ${config.stripe.plans[priceIndex].price}
                          </span>
                          <span className="text-muted-foreground text-sm">USD</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Unlock all features for your entire pool</p>
                      </div>

                      <div className="mt-4 space-y-2">
                        {[
                          "Live standings access",
                          "Real-time scoring updates",
                          "Complete tournament tracking",
                          "Full pool management",
                        ].map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <ButtonCheckout
                      priceId={config.stripe.plans[priceIndex].priceId}
                      leagueId={leagueId}
                      mode="payment"
                      metadata={{ leagueId }}
                      className="w-full max-w-sm py-4 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all duration-200 rounded-lg"
                    >
                      Lock in Your Spot - Pay Now!
                    </ButtonCheckout>

                    <div className="flex items-center justify-center text-xs text-muted-foreground">
                      <ShieldCheck className="h-4 w-4 mr-1" />
                      Secure checkout via Stripe – Trusted by millions
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}


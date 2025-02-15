"use client"

import { useLeague } from "@/app/context/LeagueContext"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { DraftTimeModal } from "./DraftTimeModal"
import { DraftCountdown } from "./DraftCountdown"
import { InviteMembers } from "./InviteMembers"
import { DraftOrderManager } from "./DraftOrderManager"
import { CommissionerGuide } from "./CommissionerGuide"
import Link from "next/link"
import { Trophy, Users, ArrowRight, Clock, AlertTriangle, ShieldCheck } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { EnergizedButton } from "../ui/energized-button"
import ButtonCheckout from "../ButtonCheckout"
import config from "@/config"

const LeagueHeaderSkeleton = () => (
  <Card className="mb-4 sm:mb-6">
    <CardContent className="p-6 space-y-6">
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

export function LeagueHeader() {
  const { leagueData, isLoading, error } = useLeague()

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
  console.log(leagueData)
  const { id: leagueId, name, contests, league_members, drafts, user_id, payment_status, league_settings } = leagueData

  const userLeagueRole = league_members.find((member: any) => member.user_id === user_id)?.role

  const isCommissioner = userLeagueRole === "commissioner"

  const isLeagueFull = league_members.every((member: any) => member.user_id !== null)
  const needsPayment = isCommissioner && payment_status !== "paid"
  const isDraftCompleted = drafts.status === "completed"
  const maxTeams = league_settings[0].max_teams

  return (
    <Card className="mb-4 sm:mb-6">
      <CardContent className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">{name}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-primary" />
                <span className="font-medium">{contests.sport.toUpperCase()}</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="font-medium">{maxTeams} Members</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-medium">
                  {" "}
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
          <div className="flex flex-col sm:flex-row items-start gap-4">
            {isCommissioner && drafts.status === "pre_draft" && (
              <>
                <DraftOrderManager leagueId={leagueId} maxTeams={maxTeams} onOrderUpdated={() => {}} />
                <DraftTimeModal />
                <CommissionerGuide
                  leagueId={leagueId}
                  hasSetDraftTime={Boolean(drafts.start_time)}
                  hasDraftOrder={league_members.every((member: any) => member.draft_position !== null)}
                  memberCount={league_members.length}
                  maxMembers={maxTeams}
                />
              </>
            )}
          </div>
        </div>

        {(drafts.status === "pre_draft" || drafts.status === "in_progress" || drafts.status === "paused") && (
          <div className="space-y-6">
            {drafts.status === "pre_draft" && <DraftCountdown />}
            {drafts.status !== "completed" && (
              <EnergizedButton asChild size="lg" className="w-full">
                <Link href={`/draft/${leagueId}`} className="flex items-center justify-center py-3">
                  <span className="relative z-10">Go to Draft Room</span>
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1 relative z-10" />
                </Link>
              </EnergizedButton>
            )}
            {!isLeagueFull && isCommissioner && (
              <>
                <Separator className="my-6" />
                <InviteMembers leagueId={leagueId} />
              </>
            )}

            {needsPayment && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg space-y-6 my-8 shadow-md">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-6 w-6 text-warning flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-lg mb-2">Don&apos;t get benched!</h3>
                    <p className="text-sm text-muted-foreground">
                      Access to standings and scoring updates will be locked after the draft. Lock in your pool now and
                      enjoy full access all tournament!
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <ButtonCheckout
                    priceId={config.stripe.plans[1].priceId}
                    leagueId={leagueId}
                    mode="payment"
                    metadata={{ leagueId }}
                    className="w-full sm:w-auto py-4 px-8 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-transform hover:scale-105"
                  >
                    Lock in Your Spot - Pay Now!
                  </ButtonCheckout>
                  <div className="flex items-center text-xs text-muted-foreground mt-3">
                    <ShieldCheck className="h-4 w-4 mr-1" />
                    Secure checkout via Stripe – Trusted by millions
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}


"use client"

import { useLeague } from "@/app/context/LeagueContext"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { DraftTimeModal } from "./DraftTimeModal"
import { DraftCountdown } from "./DraftCountdown"
import { InviteMembers } from "./InviteMembers"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Trophy, Users, ArrowRight, Clock } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import styled from "@emotion/styled"
import { keyframes } from "@emotion/react"

const pulseAnimation = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(255, 140, 0, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(255, 140, 0, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 140, 0, 0);
  }
`

const EnergizedButton = styled(Button)`
  background-color: #ff8c00;
  color: white;
  font-weight: bold;
  transition: all 0.3s ease;
  animation: ${pulseAnimation} 2s infinite;

  &:hover {
    background-color: #ff7300;
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(255, 140, 0, 0.2);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(255, 140, 0, 0.2);
  }
`

function LeagueHeaderSkeleton() {
  return (
    <Card className="mb-4 sm:mb-6">
      <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4">
        <div className="space-y-2 mb-4 sm:mb-0">
          <Skeleton className="h-6 sm:h-8 w-[150px] sm:w-[200px]" />
          <Skeleton className="h-4 w-[200px] sm:w-[300px]" />
        </div>
        <Skeleton className="h-8 sm:h-10 w-full sm:w-[140px]" />
      </CardContent>
    </Card>
  )
}

export function LeagueHeader() {
  const { leagueData, isLoading, error } = useLeague()
  console.log(leagueData)

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

  const { id: leagueId, name, contests, league_members, drafts, user_id } = leagueData

  const isCommissioner = leagueData.commissioner.id === user_id
  const isLeagueFull = league_members.every((member:any) => member.user_id !== null)
  return (
    <Card className="mb-4 sm:mb-6">
      <CardContent className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{name}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-primary" />
                <span className="font-medium">{contests.sport}</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="font-medium">{league_members.length} Members</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-medium">
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
          {isCommissioner && drafts.status === "pre_draft" && <DraftTimeModal />}
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
            {!isLeagueFull && (
              <>
                <Separator className="my-6" />
                <InviteMembers leagueId={leagueId} />
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}


"use client"

import Link from "next/link"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, Clock, Zap, ArrowRight, Plus, ListOrdered, Crown } from "lucide-react"
import { PiFootballHelmetBold, PiGolf, PiTrophy, PiBasketball } from "react-icons/pi"
import { CiBaseball } from "react-icons/ci"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import MyEntriesPage from "@/app/dashboard/pools/nfl-draft/[id]/my-entries/page"
import { useNflDraft } from "@/app/context/NflDraftContext"

interface Contest {
  id: string
  name: string
  contest_type: string
  sport: string
}

interface League {
  id: string
  name: string
  commissioner_id: string
  memberCount: number
  totalSlots?: number
  entryCount?: number // Total entries created
  contest: Contest
  draft_start_time?: string
  draft_status: "completed" | "scheduled" | "not_scheduled" | "in_progress" | "paused" | "pre_draft"
  settings?: string // JSON string for league settings
  userEntryCount?: number // How many entries the user has
  maxEntries?: number // Max entries allowed per user
}

interface LeagueCardsProps {
  league: League
  isCommissioner: boolean
}

const SportIcon = ({ sport }: { sport: string }) => {
  const iconClass = "h-6 w-6"
  switch (sport.toLowerCase()) {
    case "football":
      return <PiFootballHelmetBold className={iconClass} />
    case "ncaab":
      return <PiBasketball className={iconClass} />
    case "baseball":
      return <CiBaseball className={iconClass} />
    case "pga":
      return <PiGolf className={iconClass} />
    default:
      return <PiTrophy className={iconClass} />
  }
}

const getSportColor = (sport: string): string => {
  switch (sport.toLowerCase()) {
    case "ncaab":
      return "text-orange-500 dark:text-orange-400"
    case "football":
      return "text-emerald-500 dark:text-emerald-400"
    case "baseball":
      return "text-blue-500 dark:text-blue-400"
    case "pga":
      return "text-green-500 dark:text-green-400"
    default:
      return "text-primary"
  }
}

const getContestPath = (contestName: string) => {
  return contestName.toLowerCase().replace(/\s+/g, '-')
}

export function LeagueCards({ league, isCommissioner }: LeagueCardsProps) {
  const sport = league.contest?.sport || "Unknown"
  const contestType = league.contest?.contest_type || "Unknown"
  const sportColor = getSportColor(sport)
  const isNFLDraft = league.contest?.name.toLowerCase().includes("nfl draft") // Detect NFL Draft format

  const isNowDrafting = league.draft_status === "in_progress" || league.draft_status === "paused"

  // ✅ Parse settings JSON if available
  const settings = league.settings ? JSON.parse(league.settings) : {}
  const pickDeadline = settings.lock_entries_at ? new Date(settings.lock_entries_at) : null
  const isDeadlinePassed = pickDeadline ? new Date() > pickDeadline : false
  const maxEntries = settings.max_entries_per_user || league.maxEntries || 1
  const userEntryCount = league.userEntryCount || 0
  const canCreateEntry = userEntryCount < maxEntries && !isDeadlinePassed

  const getDraftStatusDisplay = () => {
    switch (league.draft_status) {
      case "completed":
        return "Draft Completed"
      case "in_progress":
      case "paused":
        return "Now Drafting"
      case "pre_draft":
        return league.draft_start_time
          ? `Draft: ${format(new Date(league.draft_start_time), "MMM d, h:mm a")}`
          : "Draft Scheduled"
      case "scheduled":
        return league.draft_start_time
          ? `Draft: ${format(new Date(league.draft_start_time), "MMM d, h:mm a")}`
          : "Draft Scheduled"
      default:
        return "Draft Not Scheduled"
    }
  }

  return (
    <Link href={`/dashboard/pools/${getContestPath(league.contest.name)}/${league.id}`} passHref>
      <Card
        className={`group h-full transition-all hover:shadow-md hover:-translate-y-1 ${
          isNowDrafting ? "border-primary shadow-sm" : ""
        }`}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Avatar className={`h-10 w-10 ${sportColor} bg-transparent`}>
              <AvatarFallback>
                <SportIcon sport={sport} />
              </AvatarFallback>
            </Avatar>
            <Badge variant="outline" className="text-xs font-normal">
              {contestType}
            </Badge>
          </div>
          <h3 className="text-lg font-semibold mt-2 group-hover:text-primary transition-colors">{league.name}</h3>
          <p className="text-sm text-muted-foreground">{league.contest?.name}</p>
        </CardHeader>

        <CardContent className="pb-2">
          <div className="flex items-center justify-between text-sm">
            {isNFLDraft ? (
              // 📌 NFL DRAFT: Show Member Count & Entry Count
              <>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{league.memberCount} Members</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <ListOrdered className="h-4 w-4" />
                  <span>{league.entryCount|| 0} Entries</span>
                </div>
              </>
            ) : (
              // 📌 OTHER CONTESTS: Show Member Count / Total Slots
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>
                  {league.memberCount}/{league.totalSlots}
                </span>
              </div>
            )}
            {isCommissioner && (
               <Badge variant="default" className="bg-amber-500 hover:bg-amber-600">
               <Crown className="h-3 w-3 mr-1" /> Commissioner
             </Badge>
            )}
          </div>
        </CardContent>

        <CardFooter className="pt-2 flex justify-between items-center">
          {isNFLDraft ? (
            // 📌 NFL DRAFT (Show Pick Deadline)
            <>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  {pickDeadline
                    ? `Picks Due: ${format(pickDeadline, "MMM d, h:mm a")}`
                    : "Pick Deadline Not Set"}
                </span>
              </div>
              {canCreateEntry && (
                <Link href={`/dashboard/pools/${getContestPath(league.contest.name)}/${league.id}/create-entry`} passHref>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-primary"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Create Entry  <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              )}
            </>
          ) : (
            // 📌 OTHER CONTESTS (Show Draft Status & Join Draft Button)
            <>
              <div
                className={`flex items-center gap-1 text-sm ${
                  isNowDrafting ? "text-primary font-medium" : "text-muted-foreground"
                }`}
              >
                {isNowDrafting ? <Zap className="h-4 w-4 animate-pulse" /> : <Clock className="h-4 w-4" />}
                <span>{getDraftStatusDisplay()}</span>
              </div>
              {isNowDrafting && (
                <Link href={`/draft/${league.id}`} passHref>
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-primary" onClick={(e) => e.stopPropagation()}>
                    Join Draft <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              )}
            </>
          )}
        </CardFooter>
      </Card>
    </Link>
  )
}

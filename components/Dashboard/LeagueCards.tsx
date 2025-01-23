"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, Clock } from "lucide-react"
import { PiFootballHelmetBold, PiGolf, PiTrophy, PiBasketball } from "react-icons/pi"
import { CiBaseball } from "react-icons/ci"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

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
  totalSlots: number
  contest: Contest
  draft_start_time?: string
  draft_status: "completed" | "scheduled" | "not_scheduled"
}

interface LeagueCardsProps {
  league: League
  isCommissioner: boolean
}

const SportIcon = ({ sport }: { sport: string }) => {
  const iconClass = "h-7 w-7"

  switch (sport.toLowerCase()) {
    case "football":
      return <PiFootballHelmetBold className={iconClass} />
    case "basketball":
      return <PiBasketball className={iconClass} />
    case "baseball":
      return <CiBaseball className={iconClass} />
    case "golf":
      return <PiGolf className={iconClass} />
    default:
      return <PiTrophy className={iconClass} />
  }
}

const getSportColor = (sport: string): { default: string; hover: string; badge: string } => {
  switch (sport.toLowerCase()) {
    case "basketball":
      return {
        default: "from-orange-500/10 to-orange-500/0",
        hover: "from-orange-500/20 to-orange-500/10",
        badge: "bg-orange-100 text-orange-800 border-orange-200",
      }
    case "football":
      return {
        default: "from-emerald-500/10 to-emerald-500/0",
        hover: "from-emerald-500/20 to-emerald-500/10",
        badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
      }
    case "baseball":
      return {
        default: "from-blue-500/10 to-blue-500/0",
        hover: "from-blue-500/20 to-blue-500/10",
        badge: "bg-blue-100 text-blue-800 border-blue-200",
      }
    case "golf":
      return {
        default: "from-green-500/10 to-green-500/0",
        hover: "from-green-500/20 to-green-500/10",
        badge: "bg-green-100 text-green-800 border-green-200",
      }
    default:
      return {
        default: "from-primary/10 to-primary/5",
        hover: "from-primary/20 to-primary/10",
        badge: "bg-primary-100 text-primary-800 border-primary-200",
      }
  }
}

const getContestTypeBadge = (contestType: string): string => {
  switch (contestType.toLowerCase()) {
    case "bracket":
      return "bg-purple-100 text-purple-800 border-purple-200"
    case "fantasy":
      return "bg-pink-100 text-pink-800 border-pink-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

export function LeagueCards({ league, isCommissioner }: LeagueCardsProps) {
  const contestName = league.contest?.name || "Unnamed Contest"
  const sport = league.contest?.sport || "Unknown"
  const contestType = league.contest?.contest_type || "Unknown"
  const { default: defaultGradient, hover: hoverGradient, badge: sportBadge } = getSportColor(sport)
  const contestTypeBadge = getContestTypeBadge(contestType)

  return (
    <Link href={`/dashboard/leagues/${league.id}`}>
      <Card className="group relative flex h-full flex-col p-6 transition-all hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 overflow-hidden">
        {/* Default gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br pointer-events-none transition-opacity duration-300">
          <div className={`h-full w-full bg-gradient-to-br ${defaultGradient}`} />
        </div>

        {/* Hover gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-lg pointer-events-none">
          <div className={`h-full w-full bg-gradient-to-br ${hoverGradient}`} />
        </div>

        <div className="relative flex items-start space-x-4">
          <Avatar className="h-12 w-12 bg-gradient-to-br from-muted to-muted/50 transition-transform group-hover:scale-110 ring-2 ring-background">
            <AvatarFallback className="bg-transparent">
              <SportIcon sport={sport} />
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-semibold tracking-tight group-hover:text-primary transition-colors text-foreground/90">
              {league.name}
            </h3>
            <p className="text-sm text-muted-foreground font-medium">{contestName}</p>
          </div>
        </div>

        <div className="relative mt-4 flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className={`border ${sportBadge}`}>
            {sport}
          </Badge>
          <Badge variant="secondary" className={`border ${contestTypeBadge}`}>
            {contestType}
          </Badge>
          {isCommissioner && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border border-yellow-200">
              Commissioner
            </Badge>
          )}
        </div>

        <div className="relative mt-4 flex items-center gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background/50 px-2 py-1 rounded-md">
            <Users className="h-4 w-4" />
            <span className="font-medium">
              {league.memberCount}/{league.totalSlots}
            </span>
          </div>
        </div>

        {league.draft_status !== "completed" && league.draft_start_time && (
          <div className="relative mt-2 flex items-center gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground px-2 py-1 rounded-md">
              <Clock className="h-4 w-4" />
              <span className="font-medium">Draft: {format(new Date(league.draft_start_time), "MM/dd/yy h:mm a")}</span>
            </div>
          </div>
        )}

        <div className="absolute bottom-2 right-2">
          <span className="text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100  px-2 py-1 rounded-md">
            View League →
          </span>
        </div>
      </Card>
    </Link>
  )
}


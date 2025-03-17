"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ChevronRight, Trophy } from "lucide-react"
import { useTheme } from "next-themes"

interface MatchProps {
  match: {
    id: string
    group: string
    region: string
    home_team: {
      id: string
      name: string
      seed: number
      logo_filename: string | null
    } | null
    away_team: {
      id: string
      name: string
      seed: number
      logo_filename: string | null
    } | null
    winner_id: string | null
    home_score: number | null
    away_score: number | null
    game_status: "scheduled" | "in_progress" | "completed"
  }
  roundIndex: number
  matchIndex: number
  direction?: "ltr" | "rtl"
  isSpecial?: boolean
  userTeamIds: string[]
  getTeamOwner: (teamId: string) => string | null
}

export function Match({
  match,
  roundIndex,
  matchIndex,
  direction = "ltr",
  isSpecial = false,
  userTeamIds,
  getTeamOwner,
}: MatchProps) {
  const { theme } = useTheme()
  const isRtl = direction === "rtl"

  const getWinner = (teamId: string | null) => {
    if (match.game_status === "completed") {
      if (match.winner_id) return match.winner_id === teamId
      return teamId === match.home_team?.id
        ? (match.home_score || 0) > (match.away_score || 0)
        : (match.away_score || 0) > (match.home_score || 0)
    }
    return false
  }

  return (
    <Card
      className={cn(
        "w-[100px] sm:w-[150px] h-[70px] sm:h-[80px] flex flex-col justify-center transition-all duration-300 overflow-hidden",
        isSpecial && "w-[140px] sm:w-[200px] h-[90px] sm:h-[100px] shadow-lg",
        (match.home_team && userTeamIds.includes(match.home_team.id)) ||
          (match.away_team && userTeamIds.includes(match.away_team.id))
          ? theme === "dark"
            ? "bg-primary/10 border-primary/30"
            : "bg-primary/5 border-primary/20"
          : "bg-card/80 backdrop-blur-sm",
      )}
    >
      <CardContent className={cn("p-0", isSpecial && "p-0")}>
        <TeamInfo
          team={match.home_team}
          score={match.home_score}
          isWinner={getWinner(match.home_team?.id)}
          position="top"
          direction={direction}
          isSpecial={isSpecial}
          game_status={match.game_status}
          isUserTeam={match.home_team && userTeamIds.includes(match.home_team.id)}
          ownerName={match.home_team ? getTeamOwner(match.home_team.id) : null}
        />
        <TeamInfo
          team={match.away_team}
          score={match.away_score}
          isWinner={getWinner(match.away_team?.id)}
          position="bottom"
          direction={direction}
          isSpecial={isSpecial}
          game_status={match.game_status}
          isUserTeam={match.away_team && userTeamIds.includes(match.away_team.id)}
          ownerName={match.away_team ? getTeamOwner(match.away_team.id) : null}
        />
      </CardContent>
    </Card>
  )
}

interface TeamInfoProps {
  team: {
    id: string
    name: string
    seed: number
    logo_filename: string | null
  } | null
  score: number | null
  isWinner: boolean
  position: "top" | "bottom"
  direction?: "ltr" | "rtl"
  isSpecial?: boolean
  game_status: "scheduled" | "in_progress" | "completed"
  isUserTeam: boolean
  ownerName: string | null
}

function TeamInfo({
  team,
  score,
  isWinner,
  position,
  direction = "ltr",
  isSpecial = false,
  game_status,
  isUserTeam,
  ownerName,
}: TeamInfoProps) {
  const isRtl = direction === "rtl"
  const isUndrafted = !ownerName && game_status === "completed"

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-2 py-0.5 sm:py-1 relative h-[35px] sm:h-[40px] w-full",
        position === "top" && "border-b border-border/50 rounded-t-lg",
        position === "bottom" && "rounded-b-lg",
        isSpecial && "py-1 sm:py-2 h-[45px] sm:h-[50px]",
        game_status === "completed" && !isWinner && "opacity-75",
        isUserTeam && "bg-primary/10 shadow-[0_0_10px_rgba(var(--primary),0.2)] transition-all duration-300",
        isWinner && "bg-gradient-to-r from-primary/5 to-transparent",
      )}
    >
      {team ? (
        <>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* Seed Badge */}
            <div
              className={cn(
                "flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center",
                isSpecial && "w-5 h-5 sm:w-6 sm:h-6",
                isWinner ? "bg-primary/20 text-primary-foreground" : "bg-muted text-muted-foreground",
                isUserTeam && "ring-1 ring-primary ring-offset-1",
              )}
            >
              <span className="text-[8px] sm:text-[10px] font-semibold">{team.seed}</span>
            </div>

            {/* Team Logo */}
            <div
              className={cn(
                "w-4 h-4 sm:w-5 sm:h-5 relative flex-shrink-0",
                isSpecial && "w-5 h-5 sm:w-6 sm:h-6",
                isUserTeam && "ring-1 ring-primary ring-offset-1 rounded-full",
              )}
            >
              {team.logo_filename ? (
                <Image
                  src={`/images/team-logos/${team.logo_filename}`}
                  alt={`${team.name} logo`}
                  fill
                  style={{ objectFit: "contain" }}
                  sizes="(max-width: 640px) 50px, (max-width: 768px) 75px, 100px"
                  className={cn("rounded-full", game_status === "completed" && !isWinner && "grayscale opacity-75")}
                />
              ) : (
                <Trophy className="w-full h-full text-amber-500" />
              )}
            </div>

            {/* Team Name and Owner */}
            <div className="flex flex-col min-w-0 flex-1">
              <span
                className={cn(
                  "text-[8px] sm:text-[11px] leading-tight truncate",
                  isSpecial && "text-[10px] sm:text-xs",
                  game_status === "completed" && isWinner && "font-bold",
                  isUserTeam && "text-primary",
                )}
              >
                {team.name}
              </span>
              <span
                className={cn(
                  "text-[6px] sm:text-[8px] leading-tight text-muted-foreground truncate",
                  isUndrafted && "italic",
                )}
              >
                {ownerName || "Undrafted"}
              </span>
            </div>
          </div>

          {/* Score */}
          <div className="flex items-center gap-0.5">
            {game_status === "completed" && isWinner && (
              <ChevronRight
                className={cn("h-3 w-3 sm:h-4 sm:w-4 text-primary", isSpecial && "h-4 w-4 sm:h-5 sm:w-5")}
              />
            )}
            {score !== null && (
              <span
                className={cn(
                  "text-[10px] sm:text-xs font-medium tabular-nums min-w-[14px] text-right",
                  isSpecial && "text-xs sm:text-sm",
                  game_status === "completed" && isWinner && "font-bold text-primary",
                )}
              >
                {score}
              </span>
            )}
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center space-x-2 h-full w-full text-muted-foreground">
          <div
            className={cn(
              "w-4 h-4 sm:w-5 sm:h-5 bg-muted/50 rounded-full flex items-center justify-center",
              isSpecial && "w-5 h-5 sm:w-6 sm:h-6",
            )}
          >
            <span className="text-[8px] sm:text-[10px] font-medium">?</span>
          </div>
          <span className={cn("text-[8px] sm:text-xs truncate", isSpecial && "text-[10px] sm:text-sm")}>TBD</span>
        </div>
      )}
    </div>
  )
}


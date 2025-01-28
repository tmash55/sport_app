import React from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ChevronRight, Info } from "lucide-react"
import { useTheme } from "next-themes"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

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
        "w-[100px] sm:w-[150px] h-[70px] sm:h-[80px] flex flex-col justify-center transition-all duration-300 overflow-hidden bg-background",
        isSpecial && "w-[140px] sm:w-[200px] h-[90px] sm:h-[100px] shadow-lg",
        (match.home_team && userTeamIds.includes(match.home_team.id)) ||
          (match.away_team && userTeamIds.includes(match.away_team.id))
          ? theme === "dark"
            ? "bg-primary/5"
            : "bg-primary/[0.03]"
          : "",
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
        "flex items-center space-x-1 px-2 py-0.5 sm:py-1 relative h-[35px] sm:h-[40px] w-full",
        position === "top" && "border-b border-border rounded-t-lg",
        position === "bottom" && "rounded-b-lg",
        isSpecial && "py-1 sm:py-2 h-[45px] sm:h-[50px]",
        game_status === "completed" && !isWinner && "opacity-80",
        isUserTeam && "bg-primary/10 shadow-[0_0_10px_rgba(var(--primary),0.2)] transition-all duration-300",
      )}
    >
      {team ? (
        <>
          <div className="flex items-center gap-0.5 flex-1 min-w-0">
            <div
              className={cn(
                "w-2.5 h-2.5 sm:w-4 sm:h-4 relative flex-shrink-0",
                isSpecial && "w-3.5 h-3.5 sm:w-5 sm:h-5",
                isUserTeam && "ring-1 sm:ring-2 ring-primary ring-offset-1 shadow-[0_0_5px_rgba(var(--primary),0.5)]",
              )}
            >
              {team.logo_filename ? (
                <Image
                  src={`/images/team-logos/${team.logo_filename}`}
                  alt={`${team.name} logo`}
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="(max-width: 640px) 50px, (max-width: 768px) 75px, 100px"
                  className={cn("rounded-full", game_status === "completed" && !isWinner && "grayscale")}
                />
              ) : (
                <div
                  className={cn(
                    "w-3 h-3 sm:w-4 sm:h-4 bg-gray-200 rounded-full flex items-center justify-center text-[6px] sm:text-[8px] font-medium",
                    isSpecial && "w-4 h-4 sm:w-5 sm:h-5",
                    game_status === "completed" && !isWinner && "bg-gray-300",
                  )}
                >
                  {team.seed}
                </div>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span
                className={cn(
                  "text-[7px] sm:text-[10px] leading-tight",
                  isSpecial && "text-[9px] sm:text-xs",
                  game_status === "completed" && isWinner && "font-bold",
                  game_status === "completed" && !isWinner && "font-normal",
                  isUserTeam && "text-primary font-semibold",
                )}
              >
                {team.seed} {team.name}
              </span>
              <span
                className={cn(
                  "text-[5px] sm:text-[8px] leading-tight text-muted-foreground truncate",
                  isUndrafted && "italic",
                )}
              >
                {ownerName}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            {game_status === "completed" && isWinner && (
              <ChevronRight
                className={cn(
                  "h-2 w-2 sm:h-3 sm:w-3 text-primary",
                  isRtl && "rotate-180",
                  isSpecial && "h-3 w-3 sm:h-4 sm:w-4",
                )}
              />
            )}
            {score !== null && (
              <span
                className={cn(
                  "text-[7px] sm:text-[10px] tabular-nums",
                  isSpecial && "text-[9px] sm:text-xs",
                  game_status === "completed" && isWinner && "font-bold",
                )}
              >
                {score}
              </span>
            )}
          </div>
        </>
      ) : (
        <div className={cn("flex items-center justify-center space-x-1 h-full w-full text-gray-400")}>
          <div
            className={cn(
              "w-3 h-3 sm:w-4 sm:h-4 bg-gray-200 rounded-full flex items-center justify-center text-[6px] sm:text-[8px] font-medium",
              isSpecial && "w-4 h-4 sm:w-5 sm:h-5",
            )}
          >
            ?
          </div>
          <span className={cn("text-[8px] sm:text-xs truncate", isSpecial && "text-[10px] sm:text-sm")}>TBD</span>
        </div>
      )}
    </div>
  )
}


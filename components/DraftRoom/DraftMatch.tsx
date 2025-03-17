"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { Trophy, Check, Users } from "lucide-react"
import type { Matchup, LeagueMember } from "@/types/draft"

interface DraftMatchProps {
  match: Matchup
  roundIndex: number
  matchIndex: number
  direction?: "ltr" | "rtl"
  isSpecial?: boolean
  currentUser: string
  leagueMembers: LeagueMember[]
}

export function DraftMatch({
  match,
  roundIndex,
  matchIndex,
  direction = "ltr",
  isSpecial = false,
  currentUser,
  leagueMembers,
}: DraftMatchProps) {
  const { theme } = useTheme()
  const isRtl = direction === "rtl"
  const isRoundOne = roundIndex === 0

  return (
    <Card
      className={cn(
        "w-[90px] sm:w-[110px] h-[60px] sm:h-[70px] flex flex-col justify-center transition-all duration-300 overflow-hidden border",
        isRoundOne && "w-[100px] sm:w-[120px] h-[70px] sm:h-[80px]",
        isSpecial && "w-[110px] sm:w-[130px] h-[70px] sm:h-[80px] shadow-lg",
        theme === "dark" ? "bg-card/90" : "bg-card/95",
        "backdrop-blur-sm",
      )}
    >
      <CardContent className="p-0">
        <DraftTeamInfo
          team={match.home_team}
          position="top"
          direction={direction}
          isSpecial={isSpecial}
          isRoundOne={isRoundOne}
          currentUser={currentUser}
          drafted_owner={match.drafted_home_owner}
          leagueMembers={leagueMembers}
        />
        <DraftTeamInfo
          team={match.away_team}
          position="bottom"
          direction={direction}
          isSpecial={isSpecial}
          isRoundOne={isRoundOne}
          currentUser={currentUser}
          drafted_owner={match.drafted_away_owner}
          leagueMembers={leagueMembers}
        />
      </CardContent>
    </Card>
  )
}

interface DraftTeamInfoProps {
  team: Matchup["home_team"] | Matchup["away_team"]
  position: "top" | "bottom"
  direction?: "ltr" | "rtl"
  isSpecial?: boolean
  isRoundOne?: boolean
  currentUser: string
  drafted_owner: string | null
  leagueMembers: LeagueMember[]
}

function DraftTeamInfo({
  team,
  position,
  direction = "ltr",
  isSpecial = false,
  isRoundOne = false,
  currentUser,
  drafted_owner,
  leagueMembers,
}: DraftTeamInfoProps) {
  const isRtl = direction === "rtl"
  const isDrafted = drafted_owner !== null
  const currentUserMember = leagueMembers.find((member) => member.id === currentUser)
  const isUserTeam = currentUserMember?.team_name === drafted_owner

  if (!team) {
    return (
      <div
        className={cn(
          "flex items-center justify-center px-1 py-0.5 relative h-[30px] sm:h-[35px] w-full",
          isRoundOne && "h-[35px] sm:h-[40px]",
          position === "top" && "border-b border-border/50 rounded-t-lg",
          position === "bottom" && "rounded-b-lg",
          isSpecial && "h-[35px] sm:h-[40px]",
        )}
      >
        <span className="text-[8px] sm:text-[10px] text-muted-foreground">TBD</span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1 px-1 py-1 relative h-[30px] sm:h-[35px] w-full transition-all",
        isRoundOne && "h-[35px] sm:h-[40px]",
        position === "top" && "border-b border-border/50 rounded-t-lg",
        position === "bottom" && "rounded-b-lg",
        isSpecial && "h-[35px] sm:h-[40px]",
        !isDrafted && "bg-emerald-500/10 dark:bg-emerald-500/20",
        isDrafted && !isUserTeam && "bg-muted/30",
        isUserTeam && "bg-primary/10",
      )}
    >
      {/* Seed Badge */}
      <div
        className={cn(
          "flex-shrink-0 w-3.5 h-3.5 rounded-full flex items-center justify-center",
          isRoundOne && "w-4 h-4",
          isSpecial && "w-4 h-4",
          !isDrafted
            ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
            : isUserTeam
              ? "bg-primary/20 text-primary"
              : "bg-muted text-muted-foreground",
        )}
      >
        <span className="text-[7px] font-semibold">{team.seed}</span>
      </div>

      {/* Team Logo */}
      <div
        className={cn(
          "w-3.5 h-3.5 relative flex-shrink-0",
          isRoundOne && "w-4 h-4",
          isSpecial && "w-4 h-4",
          !isDrafted && "ring-1 ring-emerald-500/50 rounded-full",
          isUserTeam && "ring-1 ring-primary/70 rounded-full",
        )}
      >
        {team.logo_filename ? (
          <Image
            src={`/images/team-logos/${team.logo_filename}`}
            alt={`${team.name} logo`}
            fill
            style={{ objectFit: "contain" }}
            sizes="(max-width: 640px) 14px, 16px"
            className={cn("rounded-full", isDrafted && !isUserTeam && "opacity-90")}
          />
        ) : (
          <Trophy className="w-full h-full text-amber-500" />
        )}
      </div>

      {/* Team Name and Status */}
      <div className="flex flex-col min-w-0 flex-1">
        <div className="flex items-center gap-0.5">
          <span
            className={cn(
              "text-[8px] leading-tight truncate max-w-[60px]",
              isRoundOne && "text-[9px]",
              isSpecial && "text-[9px]",
              !isDrafted && "font-medium text-foreground",
              isDrafted && !isUserTeam && "text-muted-foreground",
              isUserTeam && "text-primary font-medium",
            )}
          >
            {team.name}
          </span>
          {!isDrafted && <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />}
        </div>

        <span
          className={cn(
            "text-[6px] leading-tight truncate flex items-center gap-0.5",
            isRoundOne && "text-[7px]",
            !isDrafted
              ? "text-emerald-600 dark:text-emerald-400 font-medium"
              : isUserTeam
                ? "text-primary font-medium"
                : "text-muted-foreground",
          )}
        >
          {!isDrafted ? (
            "Available"
          ) : isUserTeam ? (
            <>
              <Check className="h-1.5 w-1.5" /> Your Pick
            </>
          ) : (
            <>
              <Users className="h-1.5 w-1.5" /> {drafted_owner}
            </>
          )}
        </span>
      </div>
    </div>
  )
}


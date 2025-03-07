"use client"

import type { DraftPick, LeagueMember } from "@/types/draft"
import { Trophy, ArrowRight, ArrowDown, ArrowLeft } from "lucide-react"
import Image from "next/image"
import { useMemo, useState, useEffect } from "react"
import { cn } from "@/lib/utils"

const currentPickClass = "border-2 border-primary animate-pulse"

interface DraftBoardProps {
  leagueMembers: LeagueMember[]
  draftPicks: DraftPick[]
  currentPickNumber: number
  maxTeams: number
  isDraftCompleted: boolean
  currentLeagueMemberId: string
}

const getTeamLogoUrl = (filename: string | null | undefined) => {
  return filename ? `/images/team-logos/${filename}` : ""
}

const renderDraftBoard = (
  leagueMembers: LeagueMember[],
  draftPicks: DraftPick[],
  currentPickNumber: number,
  maxTeams: number,
  isDraftCompleted: boolean,
  currentLeagueMemberId: string,
  isMobileView: boolean,
) => {
  const TOTAL_SLOTS = maxTeams
  const TOTAL_ROUNDS = Math.floor(64 / maxTeams)
  const board = []

  // Header row with member names
  const headerRow = []
  for (let slot = 0; slot < TOTAL_SLOTS; slot++) {
    const member = leagueMembers.find((m) => m.draft_position === slot + 1)
    headerRow.push(
      <div
        key={`header-${slot}`}
        className={cn(
          "p-1 sm:p-2 font-semibold text-center truncate",
          isMobileView ? "text-xs" : "text-sm",
          member?.id === currentLeagueMemberId && "bg-primary/10 text-primary rounded-md",
        )}
      >
        {member ? member.team_name || member.users.display_name : "Empty"}
      </div>,
    )
  }
  board.push(
    <div key="header" className="contents">
      {headerRow}
    </div>,
  )

  // Draft board rows
  for (let round = 0; round < TOTAL_ROUNDS; round++) {
    const rowCells = []
    for (let slot = 0; slot < TOTAL_SLOTS; slot++) {
      const isSnakeRound = round % 2 === 0
      const currentSlot = isSnakeRound ? slot : TOTAL_SLOTS - slot - 1
      const pickNumber = round * TOTAL_SLOTS + currentSlot + 1
      const pick = draftPicks.find((p) => p.pick_number === pickNumber)
      const isLastPickOfRound = isSnakeRound ? slot === TOTAL_SLOTS - 1 : slot === 0
      const isFirstPickOfRound = isSnakeRound ? slot === 0 : slot === TOTAL_SLOTS - 1
      const isUserPick = pick?.league_member_id === currentLeagueMemberId

      rowCells.push(
        <div
          key={`${round}-${currentSlot}`}
          className={cn(
            "relative bg-secondary rounded border",
            isMobileView ? "p-0.5" : "p-1 sm:p-2",
            pick ? "border-secondary-foreground/10" : "border-secondary-foreground/20",
            pickNumber === currentPickNumber && !isDraftCompleted && currentPickClass,
            isUserPick && "bg-primary/5",
            "overflow-hidden",
          )}
        >
          <div className="absolute bottom-0.5 left-1 text-xs text-muted-foreground">
            {pickNumber !== TOTAL_SLOTS * TOTAL_ROUNDS &&
              (isLastPickOfRound ? (
                <ArrowDown className="w-3 h-3 sm:w-4 sm:h-4" />
              ) : isFirstPickOfRound && round !== 0 ? (
                isSnakeRound ? (
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                ) : (
                  <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                )
              ) : isSnakeRound ? (
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
              ) : (
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              ))}
          </div>
          <div className="absolute top-0.5 right-1 text-[8px] sm:text-xs text-muted-foreground">
            {`${round + 1}.${(currentSlot + 1).toString().padStart(2, "0")}`}
          </div>
          <div
            className={cn(
              "rounded flex flex-col items-center justify-center",
              isMobileView ? "h-10 sm:h-14" : "h-16 sm:h-20",
            )}
          >
            {pick ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                  {pick?.league_teams?.global_teams?.logo_filename ? (
                    <Image
                      src={getTeamLogoUrl(pick.league_teams.global_teams.logo_filename) || "/placeholder.svg"}
                      alt={`${pick.league_teams.name} logo`}
                      width={isMobileView ? 64 : 128}
                      height={isMobileView ? 64 : 128}
                      className="object-contain"
                      loading="eager"
                      priority={true}
                    />
                  ) : (
                    <Trophy className="w-12 h-12 sm:w-16 sm:h-16 text-secondary-foreground/50" />
                  )}
                </div>
                <div className="relative z-10 flex flex-col items-center justify-center">
                  <div
                    className={cn(
                      "flex items-center justify-center rounded-full bg-background/80 backdrop-blur-sm",
                      isMobileView ? "w-6 h-6 sm:w-8 sm:h-8" : "w-12 h-12",
                      
                    )}
                  >
                    {pick?.league_teams?.global_teams?.logo_filename ? (
                      <Image
                        src={getTeamLogoUrl(pick.league_teams.global_teams.logo_filename) || "/placeholder.svg"}
                        alt={`${pick.league_teams.name} logo`}
                        width={isMobileView ? 16 : 40}
                        height={isMobileView ? 16 : 40}
                        className="object-contain"
                        loading="eager"
                        priority={true}
                      />
                    ) : (
                      <Trophy className="h-3 w-3 sm:h-4 sm:w-4 text-secondary-foreground/50" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "mt-0.5 text-[8px] sm:text-xs font-medium truncate bg-background/80 backdrop-blur-sm px-1 py-0.5 rounded max-w-full",
                      isUserPick && "",
                    )}
                  >
                    <span className="text-muted-foreground">({pick.league_teams?.seed})</span> {pick.league_teams?.name}
                  </span>
                </div>
              </div>
            ) : (
              <span
                className={cn(
                  "text-[8px] sm:text-xs",
                  pickNumber === currentPickNumber && !isDraftCompleted
                    ? "text-primary font-semibold"
                    : "text-muted-foreground",
                )}
              >
                {pickNumber === currentPickNumber && !isDraftCompleted ? "On the Clock" : ""}
              </span>
            )}
          </div>
        </div>,
      )
    }
    board.push(
      <div key={round} className="contents">
        {rowCells}
      </div>,
    )
  }

  return board
}

export function DraftBoard({
  leagueMembers,
  draftPicks,
  currentPickNumber,
  maxTeams,
  isDraftCompleted,
  currentLeagueMemberId,
}: DraftBoardProps) {
  const [isMobileView, setIsMobileView] = useState(false)

  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768)
    }
    checkMobileView()
    window.addEventListener("resize", checkMobileView)
    return () => window.removeEventListener("resize", checkMobileView)
  }, [])

  const board = useMemo(
    () =>
      renderDraftBoard(
        leagueMembers,
        draftPicks,
        currentPickNumber,
        maxTeams,
        isDraftCompleted,
        currentLeagueMemberId,
        isMobileView,
      ),
    [leagueMembers, draftPicks, currentPickNumber, maxTeams, isDraftCompleted, currentLeagueMemberId, isMobileView],
  )

  return (
    <div className="space-y-2">
      <div
        className={cn("gap-0.5 sm:gap-1 w-full")}
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${maxTeams}, minmax(0, 1fr))`,
        }}
      >
        {board}
      </div>
    </div>
  )
}


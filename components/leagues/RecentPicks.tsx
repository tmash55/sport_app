"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Trophy } from "lucide-react"
import type { DraftPick, LeagueMember } from "@/types/draft"

interface RecentPicksProps {
  draftPicks: DraftPick[]
  leagueMembers: LeagueMember[]
  currentPickNumber: number
}

export function RecentPicks({ draftPicks, leagueMembers, currentPickNumber }: RecentPicksProps) {
  const [mostRecentPick, setMostRecentPick] = useState<DraftPick | null>(null)

  useEffect(() => {
    // Check if the draft is completed
    const isDraftCompleted =
      currentPickNumber > draftPicks.length || draftPicks.length === draftPicks.filter((p) => p.pick_number).length

    let lastPick

    if (isDraftCompleted) {
      // If draft is completed, get the actual final pick
      lastPick = draftPicks.sort((a, b) => b.pick_number - a.pick_number)[0] || null
    } else {
      // Otherwise, get the most recent pick before the current one
      lastPick =
        draftPicks
          .filter((pick) => pick.pick_number < currentPickNumber)
          .sort((a, b) => b.pick_number - a.pick_number)[0] || null
    }

    setMostRecentPick(lastPick)
  }, [draftPicks, currentPickNumber])

  const getTeamLogoUrl = (filename: string | null | undefined) => {
    return filename ? `/images/team-logos/${filename}` : null
  }

  const formatPickNumber = (pickNumber: number) => {
    const leagueMemberCount = leagueMembers.length
    const round = Math.ceil(pickNumber / leagueMemberCount)
    const pickInRound = pickNumber % leagueMemberCount || leagueMemberCount
    return { round, pickInRound: pickInRound.toString().padStart(2, "0") }
  }

  if (!mostRecentPick) return null

  const drafter = leagueMembers.find((member) => member.id === mostRecentPick.league_member_id)
  const { round, pickInRound } = formatPickNumber(mostRecentPick.pick_number)
  if (!mostRecentPick) return null

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={mostRecentPick.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="bg-background/40 backdrop-blur-sm border rounded-lg p-2"
        >
          <div className="grid grid-cols-3 gap-1">
            {/* Column 1: Last Pick and Pick Number */}
            <div className="flex flex-col items-center justify-center">
              <div className="text-sm text-muted-foreground font-medium">
                {currentPickNumber > draftPicks.length ? "Last Pick" : "Final Pick"}
              </div>
              <div className="text-lg font-bold">
                {round}.{pickInRound}
              </div>
            </div>

            {/* Column 2: Team Logo */}
            <div className="flex items-center justify-center">
              <div className="h-12 w-12 relative flex items-center justify-center bg-background/60 rounded-full p-1">
                {mostRecentPick.league_teams?.global_teams?.logo_filename ? (
                  <Image
                    src={getTeamLogoUrl(mostRecentPick.league_teams.global_teams.logo_filename) || ""}
                    alt={`${mostRecentPick.league_teams.name} logo`}
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                ) : (
                  <Trophy className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
            </div>

            {/* Column 3: Team and Drafter Info */}
            <div className="flex flex-col items-start justify-center">
              <span className="font-medium text-sm">
                ({mostRecentPick.league_teams?.seed}) {mostRecentPick.league_teams?.name}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {drafter?.team_name || drafter?.users?.display_name || "Unknown"}
              </span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}


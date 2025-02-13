"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Trophy } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { DraftPick, LeagueMember } from "@/types/draft"

interface RecentPicksProps {
  draftPicks: DraftPick[]
  leagueMembers: LeagueMember[]
  currentPickNumber: number
}

export function RecentPicks({ draftPicks, leagueMembers, currentPickNumber }: RecentPicksProps) {
  const [mostRecentPick, setMostRecentPick] = useState<DraftPick | null>(null)

  useEffect(() => {
    const lastPick =
      draftPicks
        .filter((pick) => pick.pick_number < currentPickNumber)
        .sort((a, b) => b.pick_number - a.pick_number)[0] || null
    setMostRecentPick(lastPick)
  }, [draftPicks, currentPickNumber])

  const getTeamLogoUrl = (filename: string | null | undefined) => {
    return filename ? `/images/team-logos/${filename}` : null
  }

  const formatPickNumber = (pickNumber: number) => {
    const leagueMemberCount = leagueMembers.length
    const round = Math.ceil(pickNumber / leagueMemberCount)
    const pickInRound = pickNumber % leagueMemberCount || leagueMemberCount
    return `${round}.${pickInRound.toString().padStart(2, "0")}`
  }

  if (!mostRecentPick) return null

  const drafter = leagueMembers.find((member) => member.id === mostRecentPick.league_member_id)

  return (
    <div className="w-full sm:w-[240px] mx-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={mostRecentPick.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="bg-background/40 backdrop-blur-sm border-muted">
            <CardContent className="p-2">
              <div className="flex flex-col gap-1.5">
                <div className="text-md text-muted-foreground font-medium text-left">Last Pick</div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-7 bg-background/60 rounded-full shrink-0">
                    <span className="text-xs font-bold">{formatPickNumber(mostRecentPick.pick_number)}</span>
                  </div>
                  <div className="h-7 w-7 relative flex items-center justify-center bg-background/60 rounded-full p-1 shrink-0">
                    {mostRecentPick.league_teams?.global_teams?.logo_filename ? (
                      <Image
                        src={getTeamLogoUrl(mostRecentPick.league_teams.global_teams.logo_filename) || ""}
                        alt={`${mostRecentPick.league_teams.name} logo`}
                        width={24}
                        height={24}
                        className="object-contain"
                      />
                    ) : (
                      <Trophy className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium text-sm truncate">
                      ({mostRecentPick.league_teams?.seed}) {mostRecentPick.league_teams?.name}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      {drafter?.team_name || drafter?.users?.display_name || "Unknown"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}


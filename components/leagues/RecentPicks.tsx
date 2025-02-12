import { useEffect, useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Trophy } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { DraftPick, LeagueMember } from "@/types/draft"

interface RecentPicksProps {
  draftPicks: DraftPick[]
  leagueMembers: LeagueMember[]
  currentPickNumber: number
}

export function RecentPicks({ draftPicks, leagueMembers, currentPickNumber }: RecentPicksProps) {
  const [recentPicks, setRecentPicks] = useState<DraftPick[]>([])

  useEffect(() => {
    const sortedPicks = draftPicks
      .filter((pick) => pick.pick_number < currentPickNumber)
      .sort((a, b) => b.pick_number - a.pick_number)
      .slice(0, 5)
    setRecentPicks(sortedPicks)
  }, [draftPicks, currentPickNumber])

  const getTeamLogoUrl = (filename: string | null | undefined) => {
    return filename ? `/images/team-logos/${filename}` : null
  }

  return (
    <ScrollArea className="w-[600px]">
      <div className="p-2">
        <div className="flex flex-row-reverse space-x-2 space-x-reverse">
          <AnimatePresence>
            {recentPicks.map((pick, index) => {
              const drafter = leagueMembers.find((member) => member.id === pick.league_member_id)
              return (
                <motion.div
                  key={pick.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex-shrink-0 w-[150px]"
                >
                  <Card className="bg-gradient-to-r from-primary/5 to-primary/10 h-full">
                    <CardContent className="p-3 flex flex-col h-full">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center justify-center w-8 h-8 bg-background rounded-full">
                          <span className="text-sm font-semibold">{pick.pick_number}</span>
                        </div>
                        <div className="h-8 w-8 relative flex items-center justify-center bg-background rounded-full p-1">
                          {pick.league_teams?.global_teams?.logo_filename ? (
                            <Image
                              src={getTeamLogoUrl(pick.league_teams.global_teams.logo_filename) || ""}
                              alt={`${pick.league_teams.name} logo`}
                              width={24}
                              height={24}
                              className="object-contain"
                            />
                          ) : (
                            <Trophy className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col flex-grow">
                        <span className="font-semibold text-sm line-clamp-2">
                          ({pick.league_teams?.seed}) {pick.league_teams?.name}
                        </span>
                        <span className="text-xs text-muted-foreground mt-auto line-clamp-1">
                          {drafter?.team_name || drafter?.users?.display_name || "Unknown"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>
    </ScrollArea>
  )
}


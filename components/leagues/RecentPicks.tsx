import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { DraftPick, LeagueMember } from '@/types/draft'

interface RecentPicksProps {
  draftPicks: DraftPick[]
  leagueMembers: LeagueMember[]
  currentPickNumber: number
}

export function RecentPicks({ draftPicks, leagueMembers, currentPickNumber }: RecentPicksProps) {
  const [latestPick, setLatestPick] = useState<DraftPick | null>(null)

  useEffect(() => {
    if (draftPicks.length > 0 && currentPickNumber > 1) {
      const lastPick = draftPicks.find(pick => pick.pick_number === currentPickNumber - 1)
      setLatestPick(lastPick || null)
    }
  }, [draftPicks, currentPickNumber])

  const getTeamLogoUrl = (filename: string | null | undefined) => {
    return filename ? `/images/team-logos/${filename}` : null
  }

  if (!latestPick) return null

  const drafter = leagueMembers.find(member => member.id === latestPick.league_member_id)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="mb-6"
      >
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center justify-center w-16 h-16 bg-background rounded-lg">
                  <span className="text-xs text-muted-foreground">Pick</span>
                  <span className="text-2xl font-bold">{latestPick.pick_number}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 relative flex items-center justify-center bg-background rounded-lg p-2">
                    {latestPick.league_teams?.global_teams?.logo_filename ? (
                      <Image
                        src={getTeamLogoUrl(latestPick.league_teams.global_teams.logo_filename) || ""}
                        alt={`${latestPick.league_teams.name} logo`}
                        width={48}
                        height={48}
                        className="object-contain"
                      />
                    ) : (
                      <Trophy className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Latest Pick</span>
                    <span className="font-semibold">
                      ({latestPick.league_teams?.seed}) {latestPick.league_teams?.name}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      by  {drafter?.team_name || drafter?.users?.display_name || "Unknown"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="hidden lg:block text-right">
                <span className="text-sm text-muted-foreground">Next Pick</span>
                <div className="font-semibold">
                  {leagueMembers.find(member => 
                    member.draft_position === ((currentPickNumber - 1) % leagueMembers.length) + 1
                  )?.team_name || "On the Clock"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}


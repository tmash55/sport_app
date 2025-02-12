"use client"

import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { DraftRegion } from "./DraftRegion"
import type { Matchup, LeagueMember } from "@/types/draft"
import { Skeleton } from "@/components/ui/skeleton"

interface BracketViewProps {
  matchups: Matchup[]
  matchupsLoading: boolean
  matchupsError: Error | null
  currentUser: string
  leagueMembers: LeagueMember[]
}

export function BracketView({
  matchups,
  matchupsLoading,
  matchupsError,
  currentUser,
  leagueMembers,
}: BracketViewProps) {
  const bracketData = useMemo(() => {
    const data: { [key: string]: { [key: number]: Matchup[] } } = {
      East: {},
      West: {},
      South: {},
      Midwest: {},
    }

    matchups.forEach((match) => {
      const region = match.region
      const round = match.round
      if (!data[region]) {
        data[region] = {}
      }
      if (!data[region][round]) {
        data[region][round] = []
      }
      data[region][round].push(match)
    })

    return data
  }, [matchups])

  if (matchupsLoading) {
    return <Skeleton className="w-full h-[600px]" />
  }

  if (matchupsError) {
    return <div>Error loading bracket: {matchupsError.message}</div>
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4 pb-16">
        <div className="min-w-[300px] w-full max-w-[1400px] mx-auto px-2 sm:px-4">
          <div className="space-y-6 sm:space-y-8 lg:space-y-16 pb-8">
            {/* Top Regions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
              <div>
                <DraftRegion
                  name="East"
                  matchups={bracketData["East"]}
                  direction="ltr"
                  currentUser={currentUser}
                  leagueMembers={leagueMembers}
                />
              </div>
              <div>
                <DraftRegion
                  name="South"
                  matchups={bracketData["South"]}
                  direction="rtl"
                  currentUser={currentUser}
                  leagueMembers={leagueMembers}
                />
              </div>
            </div>


            {/* Bottom Regions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 pt-10 ">
              <div>
                <DraftRegion
                  name="West"
                  matchups={bracketData["West"]}
                  direction="ltr"
                  currentUser={currentUser}
                  leagueMembers={leagueMembers}
                />
              </div>
              <div>
                <DraftRegion
                  name="Midwest"
                  matchups={bracketData["Midwest"]}
                  direction="rtl"
                  currentUser={currentUser}
                  leagueMembers={leagueMembers}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


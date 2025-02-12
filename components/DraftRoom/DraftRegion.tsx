import { cn } from "@/lib/utils"
import { DraftMatch } from "./DraftMatch"
import type { Matchup, LeagueMember } from "@/types/draft"

interface DraftRegionProps {
  name: string
  matchups: {
    [key: number]: Matchup[]
  }
  direction?: "ltr" | "rtl"
  currentUser: string
  leagueMembers: LeagueMember[]
}

export function DraftRegion({ name, matchups, direction = "ltr", currentUser, leagueMembers }: DraftRegionProps) {
  if (!matchups) return null

  const calculateSpacing = (round: number) => {
    const baseSpacing = 100
    return round === 1 ? baseSpacing : baseSpacing * Math.pow(2, round - 1)
  }

  const expectedMatches = {
    1: 8,
    2: 4,
    3: 2,
    4: 1,
  }

  const normalizedMatchups = { ...matchups }
  Object.entries(expectedMatches).forEach(([round, count]) => {
    const roundNum = Number.parseInt(round)
    if (!normalizedMatchups[roundNum]) {
      normalizedMatchups[roundNum] = []
    }
    while (normalizedMatchups[roundNum].length < count) {
      normalizedMatchups[roundNum].push({
        id: `empty-${round}-${normalizedMatchups[roundNum].length}`,
        round: roundNum,
        group: `${roundNum}${String.fromCharCode(65 + normalizedMatchups[roundNum].length)}`,
        region: name,
        home_team: null,
        away_team: null,
        winning_team: null,
        home_score: null,
        away_score: null,
        game_status: "scheduled",
        drafted_home_owner: null,
        drafted_away_owner: null,
      })
    }
  })

  const isRtl = direction === "rtl"

  const sortMatchups = (matchups: Matchup[]) => {
    return [...matchups].sort((a, b) => {
      if (a.round === 1 && b.round === 1) {
        return a.group.localeCompare(b.group)
      }
      return 0
    })
  }

  return (
    <div className="w-full">
      <h3 className={cn("text-lg font-semibold mb-8", direction === "rtl" ? "text-right" : "")}>{name}</h3>
      <div
        className={cn("flex", {
          "gap-[41px]": direction === "rtl",
          "gap-[18px]": direction === "ltr",
          "flex-row-reverse pr-[30px]": direction === "rtl",
        })}
      >
        {[1, 2, 3, 4].map((round) => {
          const spacing = calculateSpacing(1)
          const matchesInRound = normalizedMatchups[round] || []
          const roundHeight = spacing * 7

          return (
            <div key={round} className="flex-1">
              <div
                className="flex flex-col relative"
                style={{
                  height: roundHeight,
                }}
              >
                {sortMatchups(matchesInRound).map((match, index) => {
                  let position

                  if (round === 1) {
                    position = index * spacing
                  } else if (round === 2) {
                    position = index * 2 * spacing + spacing * 0.5
                  } else if (round === 3) {
                    position = index * 4 * spacing + 1.5 * spacing
                  } else {
                    position = 3.5 * spacing
                  }

                  return (
                    <div
                      key={match.id}
                      className="absolute w-full"
                      style={{
                        top: position,
                      }}
                    >
                      <DraftMatch
                        key={match.id}
                        match={match}
                        roundIndex={round - 1}
                        matchIndex={index}
                        direction={direction}
                        isSpecial={round === 4}
                        currentUser={currentUser}
                        leagueMembers={leagueMembers}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}


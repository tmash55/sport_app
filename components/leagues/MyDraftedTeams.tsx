import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { DraftPick, LeagueMember } from "@/types/draft"
import Image from "next/image"

interface MyTeamsProps {
  draftPicks: DraftPick[]
  currentUser: string
  maxTeams: number
  leagueMembers: LeagueMember[]
}

export function MyTeams({ draftPicks, currentUser, maxTeams, leagueMembers }: MyTeamsProps) {
  const currentLeagueMember = leagueMembers.find((member) => member.user_id === currentUser)
  const myPicks = draftPicks
    .filter((pick) => pick.league_member_id === currentLeagueMember?.id)
    .filter((pick, index, self) => index === self.findIndex((t) => t.league_teams.id === pick.league_teams.id))
    .sort((a, b) => a.pick_number - b.pick_number)
    .slice(0, maxTeams)

  const calculateRoundAndPick = (pickNumber: number) => {
    const round = Math.ceil(pickNumber / maxTeams)
    const pickInRound = pickNumber % maxTeams || maxTeams
    return { round, pickInRound }
  }

  const remainingPicks = maxTeams - myPicks.length

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-lg font-semibold mb-4">My Teams</h3>
      <ScrollArea className="flex-grow">
        {myPicks.length > 0 ? (
          <ul className="space-y-2">
            {myPicks.map((pick) => {
              const { round, pickInRound } = calculateRoundAndPick(pick.pick_number)
              return (
                <li key={pick.league_teams.id}>
                  <Card>
                    <CardContent className="p-4 flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        {pick.league_teams.global_teams?.logo_filename && (
                          <div className="relative w-8 h-8">
                            <Image
                              src={`/images/team-logos/${pick.league_teams.global_teams.logo_filename}`}
                              alt={`${pick.league_teams.name} logo`}
                              fill
                              className="object-contain"
                            />
                          </div>
                        )}
                        <span className="text-sm font-medium">
                          {pick.league_teams.global_teams?.seed !== undefined
                            ? `(${pick.league_teams.global_teams.seed}) `
                            : ""}
                          {pick.league_teams.name}
                        </span>
                      </div>
                      <Badge variant="secondary">
                        R{round}, Pick {pickInRound}
                      </Badge>
                    </CardContent>
                  </Card>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">You haven&apos;t drafted any teams yet.</p>
        )}
      </ScrollArea>
      <div className="mt-4">
        <p className="text-sm text-muted-foreground">
          Remaining picks: <span className="font-medium">{remainingPicks}</span>
        </p>
      </div>
    </div>
  )
}


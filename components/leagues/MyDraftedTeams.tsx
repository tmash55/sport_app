import { Badge } from "@/components/ui/badge"
import { DraftPick } from "@/types/draft"

interface MyDraftedTeamsProps {
  draftPicks: DraftPick[]
  currentUserId: string
  maxTeams: number
}

export function MyDraftedTeams({ draftPicks, currentUserId, maxTeams }: MyDraftedTeamsProps) {
  const myPicks = draftPicks
    .filter(pick => pick.user_id === currentUserId)
    .sort((a, b) => a.pick_number - b.pick_number)

  const calculateRoundAndPick = (pickNumber: number) => {
    const round = Math.ceil(pickNumber / maxTeams)
    const pickInRound = pickNumber % maxTeams || maxTeams
    return { round, pickInRound }
  }

  return (
    <>
      {myPicks.length > 0 ? (
        <ul className="space-y-2">
          {myPicks.map((pick) => {
            const { round, pickInRound } = calculateRoundAndPick(pick.pick_number)
            return (
              <li key={pick.id} className="flex justify-between items-center">
                <span className="text-sm">
                  ({pick.league_teams.seed}) {pick.league_teams.name}
                </span>
                <Badge variant="secondary">
                  R{round}, Pick {pickInRound}
                </Badge>
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="text-muted-foreground text-sm">You haven&apos;t drafted any teams yet.</p>
      )}
    </>
  )
}


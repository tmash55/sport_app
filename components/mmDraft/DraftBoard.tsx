import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface DraftBoardProps {
  leagueMembers: any[]
  draftPicks: any[]
  currentPickNumber: number
  maxTeams: number
  isDraftCompleted: boolean
}

export function DraftBoard({
  leagueMembers,
  draftPicks,
  currentPickNumber,
  maxTeams,
  isDraftCompleted,
}: DraftBoardProps) {
  const rounds = Math.ceil(64 / maxTeams)

  const getDraftPick = (round: number, position: number) => {
    const pickNumber = (round - 1) * maxTeams + position
    return draftPicks.find((pick) => pick.pick_number === pickNumber)
  }

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Position</TableHead>
            {Array.from({ length: rounds }, (_, i) => (
              <TableHead key={i + 1} className="text-center">
                Round {i + 1}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {leagueMembers.map((member) => (
            <TableRow key={member.id}>
              <TableCell className="font-medium">{member.team_name || member.users.display_name}</TableCell>
              {Array.from({ length: rounds }, (_, roundIndex) => {
                const pick = getDraftPick(roundIndex + 1, member.draft_position)
                const isCurrentPick =
                  !isDraftCompleted && currentPickNumber === roundIndex * maxTeams + member.draft_position

                return (
                  <TableCell
                    key={roundIndex}
                    className={cn("text-center p-1", isCurrentPick && "bg-primary/10 animate-pulse")}
                  >
                    {pick ? (
                      <div className="flex items-center justify-center space-x-2">
                        {pick.league_teams.global_teams?.logo_filename && (
                          <div className="relative w-6 h-6">
                            <Image
                              src={`/images/team-logos/${pick.league_teams.global_teams.logo_filename}`}
                              alt={`${pick.league_teams.name} logo`}
                              fill
                              className="object-contain"
                            />
                          </div>
                        )}
                        <span className="text-sm">{pick.league_teams.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {pick.league_teams.global_teams?.seed}
                        </Badge>
                      </div>
                    ) : isCurrentPick ? (
                      <span className="text-sm font-medium">On the clock</span>
                    ) : null}
                  </TableCell>
                )
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}


import { DraftPick, LeagueMember } from "@/types/draft"
import { Trophy } from 'lucide-react'
import { useMemo } from 'react'

const currentPickClass = "border-2 border-primary animate-pulse"

interface DraftBoardProps {
  leagueMembers: LeagueMember[]
  draftPicks: DraftPick[]
  currentPickNumber: number
  maxTeams: number
  isDraftCompleted: boolean  
}



const renderDraftBoard = (leagueMembers: LeagueMember[], draftPicks: DraftPick[], currentPickNumber: number, maxTeams: number, isDraftCompleted: boolean) => {
  const TOTAL_SLOTS = maxTeams;
  const TOTAL_ROUNDS = Math.floor(64 / maxTeams);

  // Helper function to get the image URL
  // const getTeamLogoUrl = (filename: string | null | undefined) => {
  //   if (!filename) return null
  //   // Remove any leading slashes and ensure proper formatting
  //   const cleanFilename = filename.replace(/^\/+/, '')
  //   return `/images/team-logos/${cleanFilename}`
  // }

  // const TeamLogo = memo(({ filename, teamName }: { filename: string | null, teamName: string }) => {
  //   const [imageError, setImageError] = useState(false)
  //   const logoUrl = getTeamLogoUrl(filename)

  //   if (!logoUrl || imageError) {
  //     return (
  //       <div className="w-12 h-12 flex items-center justify-center bg-secondary-foreground/10 rounded-full">
  //         <Trophy className="w-6 h-6 text-secondary-foreground/50" />
  //       </div>
  //     )
  //   }

  //   return (
  //     <Image
  //       src={logoUrl}
  //       alt={`${teamName} logo`}
  //       width={48}
  //       height={48}
  //       className="opacity-20"
  //       priority
  //       onError={() => {
  //         console.error(`Failed to load image: ${logoUrl}`)
  //         setImageError(true)
  //       }}
  //     />
  //   )
  // })

  const board = []

  // Header row with member names
  const headerRow = []
  for (let slot = 0; slot < TOTAL_SLOTS; slot++) {
    const member = leagueMembers.find(m => m.draft_position === slot + 1)
    headerRow.push(
      <div key={`header-${slot}`} className="p-2 font-semibold text-center truncate">
        {member ? (member.team_name || member.users.display_name) : 'Empty'}
      </div>
    )
  }
  board.push(<div key="header" className="contents">{headerRow}</div>)

  // Draft board rows
  for (let round = 0; round < TOTAL_ROUNDS; round++) {
    const rowCells = []
    for (let slot = 0; slot < TOTAL_SLOTS; slot++) {
      const isSnakeRound = round % 2 === 0
      const currentSlot = isSnakeRound ? slot : TOTAL_SLOTS - slot - 1
      const pickNumber = round * TOTAL_SLOTS + currentSlot + 1
      const pick = draftPicks.find(p => p.pick_number === pickNumber)

      rowCells.push(
        <div key={`${round}-${currentSlot}`}
          className={`relative bg-secondary p-2 rounded ${
            pick ? 'border-secondary-foreground/10' : 'border-secondary-foreground/20'
          } border ${pickNumber === currentPickNumber && !isDraftCompleted ? currentPickClass : ''}`}>
          <div className="absolute top-1 left-2 text-xs text-muted-foreground">
            {pickNumber !== TOTAL_SLOTS * TOTAL_ROUNDS ? (
              slot === 0 ?
                (round === 0 ? '→' : '↓') :
                (isSnakeRound ?
                  (currentSlot === TOTAL_SLOTS - 1 ? '↓' : '→') :
                  (currentSlot === 0 ? '↓' : '←')
                )
            ) : null}
          </div>
          <div className="absolute top-1 right-2 text-xs text-muted-foreground">
            {`${round + 1}.${(currentSlot + 1).toString().padStart(2, '0')}`}
          </div>
          <div className="h-16 rounded flex flex-col items-center justify-center p-1">
            {pick ? (
              <>
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className="relative w-12 h-12 flex items-center justify-center bg-secondary-foreground/10 rounded-full">
                    <Trophy className="w-6 h-6 text-secondary-foreground/50" />
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xs font-medium truncate bg-secondary bg-opacity-70 px-1 rounded">
                      <span className="text-muted-foreground">({pick.league_teams.seed})</span> {pick.league_teams.name}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <span className={`text-xs ${pickNumber === currentPickNumber && !isDraftCompleted ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                {pickNumber === currentPickNumber && !isDraftCompleted ? "On the Clock" : ""}
              </span>
            )}
          </div>
        </div>
      )
    }
    board.push(
      <div key={round} className="contents">
        {rowCells}
      </div>
    )
  }

  return board
}

export function DraftBoard({ leagueMembers, draftPicks, currentPickNumber, maxTeams, isDraftCompleted }: DraftBoardProps) {
  const board = useMemo(() => renderDraftBoard(leagueMembers, draftPicks, currentPickNumber, maxTeams, isDraftCompleted), [leagueMembers, draftPicks, currentPickNumber, maxTeams, isDraftCompleted])

  return (
    <div
      className="gap-2 min-w-[800px]"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${maxTeams}, minmax(0, 1fr))`,
      }}
    >
      {board}
    </div>
  )
}


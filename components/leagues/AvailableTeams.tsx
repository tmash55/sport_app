import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
// import { Switch } from "@/components/ui/switch"
// import { Label } from "@/components/ui/label"
import { LeagueTeam } from "@/types/draft"
import { createClient } from "@/libs/supabase/client"

interface AvailableTeamsProps {
  leagueId: string
  teams: LeagueTeam[]
  draftedTeamIds: Set<string>
  onDraftPick: (teamId: string) => void
  isUsersTurn: boolean
  isDraftInProgress: boolean
}

interface LocalTeam extends LeagueTeam {
  is_drafted: boolean;
}

export function AvailableTeams({ 
  leagueId,
  teams, 
  draftedTeamIds, 
  onDraftPick, 
  isUsersTurn, 
  isDraftInProgress 
}: AvailableTeamsProps) {
  // const [showDraftedTeams, setShowDraftedTeams] = useState(false)
  const [localTeams, setLocalTeams] = useState<LocalTeam[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const supabase = createClient()

  useEffect(() => {
    setLocalTeams(teams.map(team => ({
      ...team,
      is_drafted: draftedTeamIds.has(team.id)
    })))

    // Set up real-time subscription
    const subscription = supabase
      .channel(`draft_picks_${leagueId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'draft_picks',
          filter: `league_id=eq.${leagueId}`
        }, 
        (payload) => {
          setLocalTeams(prevTeams => 
            prevTeams.map(team => 
              team.id === payload.new.team_id 
                ? { ...team, is_drafted: true } 
                : team
            )
          )
        }
      )
      .subscribe()

    // Cleanup subscription on component unmount
    return () => {
      subscription.unsubscribe()
    }
  }, [teams, draftedTeamIds, leagueId, supabase])

  const filteredTeams = useMemo(() => {
    return localTeams
      .filter(team => !team.is_drafted &&
        (team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
         team.global_teams.seed.toString().includes(searchQuery))
      )
      .sort((a, b) => a.global_teams.seed - b.global_teams.seed)
  }, [localTeams, searchQuery])

  return (
    <div>
      {/* <div className="flex items-center space-x-2 mb-4">
        <Switch
          id="show-drafted"
          checked={showDraftedTeams}
          onCheckedChange={setShowDraftedTeams}
        />
        <Label htmlFor="show-drafted">Show drafted teams</Label>
      </div> */}
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search teams by name or seed"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
      </div>
      <ScrollArea className="h-[400px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Draft</TableHead>
              <TableHead>Seed</TableHead>
              <TableHead>Team Name</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTeams.map((team) => (
              <TableRow key={team.id} className={team.is_drafted ? "opacity-50" : ""}>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDraftPick(team.id)}
                    disabled={!isUsersTurn || !isDraftInProgress || team.is_drafted}
                  >
                    Draft
                  </Button>
                </TableCell>
                <TableCell>{team.global_teams.seed}</TableCell>
                <TableCell>
                  <span className="text-muted-foreground">({team.global_teams.seed})</span> {team.name}
                </TableCell>
                <TableCell>{team.is_drafted ? "Drafted" : "Available"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  )
}


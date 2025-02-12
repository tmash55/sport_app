import { useState, useEffect, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { LeagueTeam } from "@/types/draft"
import { Search, Trophy } from "lucide-react"
import Image from "next/image"
import { createClient } from "@/libs/supabase/client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AvailableTeamsTableProps {
  leagueId: string
  availableTeams: LeagueTeam[]
  draftedTeamIds: Set<string> | string[]
  onTeamSelect: (teamId: string) => Promise<void>
  isMyTurn: boolean
  isDraftInProgress: boolean
}

interface LocalTeam extends LeagueTeam {
  is_drafted: boolean
}

export function AvailableTeamsTable({
  leagueId,
  availableTeams,
  draftedTeamIds: initialDraftedTeamIds,
  onTeamSelect,
  isMyTurn,
  isDraftInProgress,
}: AvailableTeamsTableProps) {
  const [localTeams, setLocalTeams] = useState<LocalTeam[]>([])
  const [draftedTeamIds, setDraftedTeamIds] = useState<Set<string>>(new Set(initialDraftedTeamIds))
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSeed, setSelectedSeed] = useState<string>("all")
  const supabase = createClient()

  useEffect(() => {
    setLocalTeams(
      availableTeams.map((team) => ({
        ...team,
        is_drafted: draftedTeamIds.has(team.id),
      })),
    )
  }, [availableTeams, draftedTeamIds])

  useEffect(() => {
    const subscription = supabase
      .channel(`draft_picks_${leagueId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "draft_picks",
          filter: `league_id=eq.${leagueId}`,
        },
        (payload) => {
          const newDraftedTeamId = payload.new.team_id

          setDraftedTeamIds((prev) => {
            const updatedSet = new Set(prev)
            updatedSet.add(newDraftedTeamId)
            return updatedSet
          })

          setLocalTeams((prevTeams) =>
            prevTeams.map((team) => (team.id === newDraftedTeamId ? { ...team, is_drafted: true } : team)),
          )
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [leagueId, supabase])

  const filteredTeams = useMemo(() => {
    return localTeams
      .filter((team) => {
        const matchesSearch =
          team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          team.global_teams?.seed.toString().includes(searchTerm)
        const matchesSeed = selectedSeed === "all" || team.global_teams?.seed.toString() === selectedSeed
        return matchesSearch && matchesSeed && !team.is_drafted
      })
      .sort((a, b) => (a.global_teams?.seed || 0) - (b.global_teams?.seed || 0))
  }, [localTeams, searchTerm, selectedSeed])

  const getTeamLogoUrl = (filename: string | null | undefined) => {
    return filename ? `/images/team-logos/${filename}` : null
  }

  const uniqueSeeds = [...new Set(localTeams.map((team) => team.global_teams?.seed).filter(Boolean))].sort(
    (a, b) => a - b,
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2 flex-grow">
          <div className="relative w-48">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <Select value={selectedSeed} onValueChange={setSelectedSeed}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Seed" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Seeds</SelectItem>
            {uniqueSeeds.map((seed) => (
              <SelectItem key={seed} value={seed.toString()}>
                {seed}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="h-[calc(100vh-300px)] w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Draft</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Conference</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Offensive Rating</TableHead>
              <TableHead>Defensive Rating</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTeams.map((team) => (
              <TableRow key={team.id}>
                <TableCell>
                  <Button
                    variant={isMyTurn && isDraftInProgress ? "default" : "outline"}
                    size="sm"
                    onClick={() => onTeamSelect(team.id)}
                    disabled={!isMyTurn || !isDraftInProgress || team.is_drafted}
                    className={isMyTurn && isDraftInProgress ? "bg-green-500 hover:bg-green-600" : ""}
                  >
                    Draft
                  </Button>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {team.global_teams?.logo_filename ? (
                      <Image
                        src={getTeamLogoUrl(team.global_teams.logo_filename) || "/placeholder.svg"}
                        alt={`${team.name} logo`}
                        width={32}
                        height={32}
                        className="object-contain w-8 h-8 min-w-[32px]"
                      />
                    ) : (
                      <Trophy className="h-6 w-6 text-secondary-foreground/50" />
                    )}
                    <span>
                      ({team.global_teams?.seed}) {team.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  )
}


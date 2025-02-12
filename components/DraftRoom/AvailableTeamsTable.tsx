"use client"
import { useState, useEffect, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { Trophy } from 'lucide-react'
import type { LeagueTeam } from "@/types/draft"
import { createClient } from "@/libs/supabase/client"

interface AvailableTeamsTableProps {
  leagueId: string
  teams: LeagueTeam[]
  draftedTeamIds: Set<string>
  onDraftTeam?: (teamId: string) => void
  isMyTurn: boolean
  isDraftInProgress: boolean
}

interface LocalTeam extends LeagueTeam {
  is_drafted: boolean
}

export function AvailableTeamsTable({ 
  leagueId, 
  teams, 
  draftedTeamIds: initialDraftedTeamIds, 
  onDraftTeam, 
  isMyTurn, 
  isDraftInProgress 
}: AvailableTeamsTableProps) {
  const [localTeams, setLocalTeams] = useState<LocalTeam[]>([])
  const [draftedTeamIds, setDraftedTeamIds] = useState<Set<string>>(new Set(initialDraftedTeamIds))
  const [searchQuery, setSearchQuery] = useState("")
  const supabase = createClient()

  useEffect(() => {
    setLocalTeams(
      teams.map((team) => ({
        ...team,
        is_drafted: draftedTeamIds.has(team.id),
      }))
    )
  }, [teams, draftedTeamIds])

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
          setDraftedTeamIds((prev) => new Set(prev).add(newDraftedTeamId))
          setLocalTeams((prevTeams) =>
            prevTeams.map((team) =>
              team.id === newDraftedTeamId ? { ...team, is_drafted: true } : team
            )
          )
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [leagueId, supabase])

  const filteredTeams = useMemo(() => {
    return localTeams
      .filter(
        (team) =>
          !team.is_drafted &&
          (team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            team.global_teams.seed.toString().includes(searchQuery))
      )
      .sort((a, b) => a.global_teams.seed - b.global_teams.seed)
  }, [localTeams, searchQuery])

  return (
    <div className="space-y-4">
      <Input
        type="text"
        placeholder="Search teams by name or seed"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full"
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Team</TableHead>
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTeams.map((team) => (
            <TableRow key={team.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 relative flex-shrink-0">
                    {team.global_teams?.logo_filename ? (
                      <Image
                        src={`/images/team-logos/${team.global_teams.logo_filename}`}
                        alt={`${team.name} logo`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <Trophy className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">
                      {team.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Seed: {team.global_teams?.seed || 'N/A'}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Button
                  variant={isMyTurn ? "default" : "outline"}
                  size="sm"
                  onClick={() => onDraftTeam?.(team.id)}
                  disabled={!isMyTurn || !isDraftInProgress}
                  className={isMyTurn && isDraftInProgress ? "bg-green-500 hover:bg-green-600 w-full" : "w-full"}
                >
                  Draft
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

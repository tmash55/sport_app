"use client"

import { useMemo } from "react"
import Image from "next/image"
import { Trophy, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { LeagueTeam, DraftPick } from "@/types/draft"
import { createClient } from "@/libs/supabase/client"
import { useState } from "react"

const supabase = createClient()

interface AvailableTeamsProps {
  leagueId: string
  draftId: string
  onDraftPick: (teamId: string) => void
  isUsersTurn: boolean
  isDraftInProgress: boolean
  leagueTeams: LeagueTeam[]  // ✅ Use props
  draftPicks: DraftPick[]  // ✅ Use props
}

export function AvailableTeams({
  leagueId,
  draftId,
  onDraftPick,
  isUsersTurn,
  isDraftInProgress,
  leagueTeams, // ✅ Get from props
  draftPicks, // ✅ Get from props
}: AvailableTeamsProps) {
  const [searchQuery, setSearchQuery] = useState("")

  // ✅ Create Set of Drafted Teams
  const draftedTeamIds = useMemo(() => new Set(draftPicks.map((pick) => pick.team_id)), [draftPicks])

  // ✅ Filter Available Teams
  const filteredTeams = useMemo(() => {
    return leagueTeams
      .filter((team) => !draftedTeamIds.has(team.id))
      .filter(
        (team) =>
          (team.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
          team.global_teams.seed.toString().includes(searchQuery),
      )
      .sort((a, b) => a.global_teams.seed - b.global_teams.seed)
  }, [leagueTeams, draftedTeamIds, searchQuery])

  return (
    <div className="flex flex-col h-full">
      {/* Search input */}
      <div className="relative mb-4 px-2">
        <Search className="absolute left-4 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search teams by name or seed..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-8"
        />
      </div>

      {/* Teams Table */}
      <ScrollArea className="flex-1 px-2">
        <Table>
          <TableHeader className="sticky top-0 bg-background/95 backdrop-blur">
            <TableRow>
              <TableHead className="w-[100px]"></TableHead>
              <TableHead className="w-[60px] text-center">Seed</TableHead>
              <TableHead>Team</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTeams.map((team) => (
              <TableRow key={team.id} className="group">
                <TableCell className="font-medium py-2">
                  <Button
                    variant={isUsersTurn ? "default" : "outline"}
                    size="sm"
                    onClick={() => onDraftPick(team.id)}
                    disabled={!isUsersTurn || !isDraftInProgress}
                  >
                    Draft
                  </Button>
                </TableCell>
                <TableCell className="text-center py-2">
                  <Badge variant="secondary" className="font-mono">
                    {team.global_teams.seed}
                  </Badge>
                </TableCell>
                <TableCell className="py-2">
                  <div className="flex items-center gap-3">
                    <span className="truncate">{team.name}</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  )
}



"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { Search, HelpCircle, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { LeagueTeam, DraftPick } from "@/types/draft"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AvailableTeamsProps {
  leagueId: string
  draftId: string
  onDraftPick: (teamId: string) => void
  isUsersTurn: boolean
  isDraftInProgress: boolean
  leagueTeams: LeagueTeam[]
  draftPicks: DraftPick[]
}

export function AvailableTeams({
  leagueId,
  draftId,
  onDraftPick,
  isUsersTurn,
  isDraftInProgress,
  leagueTeams,
  draftPicks,
}: AvailableTeamsProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedConference, setSelectedConference] = useState<string>("all")
  const [sortColumn, setSortColumn] = useState<keyof LeagueTeam["global_teams"] | "name">("seed")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  const draftedTeamIds = useMemo(() => new Set(draftPicks.map((pick) => pick.team_id)), [draftPicks])

  const conferences = useMemo(() => {
    const conferenceSet = new Set(leagueTeams.map((team) => team.global_teams.conference))
    return Array.from(conferenceSet).sort()
  }, [leagueTeams])

  const filteredTeams = useMemo(() => {
    return leagueTeams
      .filter((team) => !draftedTeamIds.has(team.id))
      .filter((team) => team.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      .filter((team) => selectedConference === "all" || team.global_teams.conference === selectedConference)
      .sort((a, b) => {
        if (sortColumn === "name") {
          return sortDirection === "asc"
            ? (a.name ?? "").localeCompare(b.name ?? "")
            : (b.name ?? "").localeCompare(a.name ?? "")
        }
        const aValue = a.global_teams[sortColumn]
        const bValue = b.global_teams[sortColumn]
        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortDirection === "asc" ? aValue - bValue : bValue - aValue
        }
        return 0
      })
  }, [leagueTeams, draftedTeamIds, searchQuery, sortColumn, sortDirection, selectedConference])

  const handleSort = (column: keyof LeagueTeam["global_teams"] | "name") => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const getLogoUrl = (filename: string | null) => {
    return filename ? `/images/team-logos/${filename}` : null
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col sm:flex-row gap-4 mb-4 px-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search teams by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-8"
          />
        </div>
        <Select value={selectedConference} onValueChange={setSelectedConference}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Conference" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Conferences</SelectItem>
            {conferences.map((conference) => (
              <SelectItem key={conference} value={conference}>
                {conference}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="flex-1 px-2">
        <Table>
          <TableHeader className="sticky top-0 bg-background/95 backdrop-blur">
            <TableRow>
              <TableHead className="w-[100px]"></TableHead>
              <TableHead className="w-[250px]">Team</TableHead>
              <TableHead className="hidden sm:table-cell cursor-pointer" onClick={() => handleSort("conference")}>
                Conference {sortColumn === "conference" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead className="text-center cursor-pointer" onClick={() => handleSort("wins")}>
                Record {sortColumn === "wins" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead className="hidden md:table-cell text-center">
                <div className="flex items-center justify-center gap-1">
                  <span className="cursor-pointer" onClick={() => handleSort("bpi_rank")}>
                    BPI {sortColumn === "bpi_rank" && (sortDirection === "asc" ? "↑" : "↓")}
                  </span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="font-medium mb-1">Basketball Power Index (BPI)</p>
                        <p>
                          A measure of team strength that accounts for game-by-game efficiency, strength of schedule,
                          pace, days of rest, game location, and key player availability.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </TableHead>
              <TableHead className="hidden lg:table-cell text-center">
                <div className="flex items-center justify-center gap-1">
                  <span className="cursor-pointer" onClick={() => handleSort("sos")}>
                    SOS {sortColumn === "sos" && (sortDirection === "asc" ? "↑" : "↓")}
                  </span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="font-medium mb-1">Strength of Schedule (SOS)</p>
                        <p>
                          A rating of team&apos;s schedule difficulty based on the win/loss records of their opponents.
                          Higher numbers indicate a more challenging schedule.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </TableHead>
              <TableHead className="hidden md:table-cell text-center">
                <div className="flex items-center justify-center gap-1">
                  <span className="cursor-pointer" onClick={() => handleSort("quality_wins")}>
                    QUAL WINS {sortColumn === "quality_wins" && (sortDirection === "asc" ? "↑" : "↓")}
                  </span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="font-medium mb-1">Quality Wins-Losses</p>
                        <p>Number of Wins and Losses against current top 50 BPI teams.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </TableHead>
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
                <TableCell className="py-2">
                  <div className="flex items-center gap-3">
                    {team.global_teams.logo_filename && (
                      <div className="relative w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center overflow-hidden bg-white rounded-full">
                        <Image
                          src={getLogoUrl(team.global_teams.logo_filename) || "/placeholder.svg"}
                          alt={`${team.name} logo`}
                          width={40}
                          height={40}
                          className="object-contain max-w-full max-h-full"
                        />
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="font-medium">{team.name}</span>
                      <span className="text-xs sm:text-sm text-muted-foreground">Seed #{team.global_teams.seed}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell py-2">{team.global_teams.conference}</TableCell>
                <TableCell className="text-center py-2">
                  {team.global_teams.wins}-{team.global_teams.losses}
                </TableCell>
                <TableCell className="hidden md:table-cell text-center py-2">{team.global_teams.bpi_rank}</TableCell>
                <TableCell className="hidden lg:table-cell text-center py-2">{team.global_teams.sos}</TableCell>
                <TableCell className="hidden md:table-cell text-center py-2">
                  {team.global_teams.quality_wins}-{team.global_teams.quality_losses}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  )
}


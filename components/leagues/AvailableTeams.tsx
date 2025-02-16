"use client"

import { useMemo, useState, useEffect } from "react"
import Image from "next/image"
import { Search, Filter, LayoutGrid, Table2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { LeagueTeam, DraftPick } from "@/types/draft"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useMediaQuery } from "@/hooks/use-media-query"

type ViewMode = "card" | "table"

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
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [viewMode, setViewMode] = useState<ViewMode>("table")

  useEffect(() => {
    setViewMode(isMobile ? "card" : "table")
  }, [isMobile])

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
    <div className="flex flex-col h-full space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search teams by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 pr-4"
        />
      </div>

      {/* Filters Row */}
      <div className="grid grid-cols-2 gap-2">
        <Select value={selectedConference} onValueChange={setSelectedConference}>
          <SelectTrigger>
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="All Conferences" />
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

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <ToggleGroup type="single" value={viewMode} onValueChange={(value: ViewMode) => setViewMode(value)}>
                <ToggleGroupItem value="card" aria-label="Card View" className="flex-1">
                  <LayoutGrid className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="table" aria-label="Table View" className="flex-1">
                  <Table2 className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{viewMode === "card" ? "Switch to Table View" : "Switch to Card View"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-0">
        {viewMode === "card" && (
          <div className="space-y-2">
            {filteredTeams.map((team) => (
              <Card key={team.id} className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {team.global_teams.logo_filename && (
                      <div className="relative w-12 h-12 flex items-center justify-center overflow-hidden bg-white rounded-full">
                        <Image
                          src={getLogoUrl(team.global_teams.logo_filename) || "/placeholder.svg"}
                          alt={`${team.name} logo`}
                          width={48}
                          height={48}
                          className="object-contain"
                        />
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="font-medium text-base">{team.name}</span>
                      <span className="text-sm text-muted-foreground">Seed #{team.global_teams.seed}</span>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{team.global_teams.conference}</span>
                        <span>•</span>
                        <span>
                          {team.global_teams.wins}-{team.global_teams.losses}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant={isUsersTurn ? "default" : "outline"}
                    size="sm"
                    onClick={() => onDraftPick(team.id)}
                    disabled={!isUsersTurn || !isDraftInProgress}
                  >
                    Draft
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                  <div className="text-center">
                    <div className="text-muted-foreground">BPI</div>
                    <div className="font-medium">{team.global_teams.bpi_rank}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-muted-foreground">SOS</div>
                    <div className="font-medium">{team.global_teams.sos}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-muted-foreground">Quality</div>
                    <div className="font-medium">
                      {team.global_teams.quality_wins}-{team.global_teams.quality_losses}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {viewMode === "table" && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]"></TableHead>
                  <TableHead className="w-[250px]">Team</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("conference")}>
                    Conference {sortColumn === "conference" && (sortDirection === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead className="text-center cursor-pointer" onClick={() => handleSort("wins")}>
                    Record {sortColumn === "wins" && (sortDirection === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead className="text-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="cursor-pointer" onClick={() => handleSort("bpi_rank")}>
                          BPI {sortColumn === "bpi_rank" && (sortDirection === "asc" ? "↑" : "↓")}
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-medium mb-1">Basketball Power Index (BPI)</p>
                          <p>A measure of team strength that accounts for game-by-game efficiency.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableHead>
                  <TableHead className="text-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="cursor-pointer" onClick={() => handleSort("sos")}>
                          SOS {sortColumn === "sos" && (sortDirection === "asc" ? "↑" : "↓")}
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-medium mb-1">Strength of Schedule (SOS)</p>
                          <p>Rating of schedule difficulty based on opponents' records.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableHead>
                  <TableHead className="text-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="cursor-pointer" onClick={() => handleSort("quality_wins")}>
                          QUAL WINS {sortColumn === "quality_wins" && (sortDirection === "asc" ? "↑" : "↓")}
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-medium mb-1">Quality Wins-Losses</p>
                          <p>Record against top 50 BPI teams.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeams.map((team) => (
                  <TableRow key={team.id}>
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
                          <div className="relative w-10 h-10 flex items-center justify-center overflow-hidden bg-white rounded-full">
                            <Image
                              src={getLogoUrl(team.global_teams.logo_filename) || "/placeholder.svg"}
                              alt={`${team.name} logo`}
                              width={40}
                              height={40}
                              className="object-contain"
                            />
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="font-medium">{team.name}</span>
                          <span className="text-sm text-muted-foreground">Seed #{team.global_teams.seed}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-2">{team.global_teams.conference}</TableCell>
                    <TableCell className="text-center py-2">
                      {team.global_teams.wins}-{team.global_teams.losses}
                    </TableCell>
                    <TableCell className="text-center py-2">{team.global_teams.bpi_rank}</TableCell>
                    <TableCell className="text-center py-2">{team.global_teams.sos}</TableCell>
                    <TableCell className="text-center py-2">
                      {team.global_teams.quality_wins}-{team.global_teams.quality_losses}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}


"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Trophy, X, ChevronUp, ChevronDown, ChevronsUpDown, ChevronDownIcon, CheckIcon, Edit2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { useLeague,  } from "@/app/context/LeagueContext"
import Image from "next/image"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { updateTeamName } from "@/app/actions/updateTeamName"
import { Input } from "../ui/input"


type LeagueMember = {
  id: string
  team_name: string
  avatar_url: string | null
  users: {
    email: string
    display_name: string | null
  }
}

type DraftedTeam = {
  id: string
  name: string
  global_teams: {
    id: string
    seed: number
    logo_filename: string | null
    round_1_win: boolean | null
    round_2_win: boolean | null
    round_3_win: boolean | null
    round_4_win: boolean | null
    round_5_win: boolean | null
    round_6_win: boolean | null
    round_1_upset: number | null
    round_2_upset: number | null
    round_3_upset: number | null
    round_4_upset: number | null
    round_5_upset: number | null
    round_6_upset: number | null
    is_eliminated: boolean
  }
  scores: number[]
  totalScore: number
}

type SortConfig = {
  key: string
  direction: "ascending" | "descending"
}

export function LeagueTeam() {
  const { leagueData, isLoading, error, refreshLeagueData } = useLeague()
  const { toast } = useToast()
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "totalScore", direction: "descending" })
  const [isEditingTeamName, setIsEditingTeamName] = useState(false)
  const [newTeamName, setNewTeamName] = useState("")
  const { leagueMember, draftedTeams } = useMemo(() => {
    if (!leagueData) return { leagueMember: null, draftedTeams: [] }

    const selectedMember =
      leagueData.league_members.find((member: any) => member.id === selectedMemberId) ||
      leagueData.league_members.find((member: any) => member.user_id === leagueData.user_id)

    if (!selectedMember) return { leagueMember: null, draftedTeams: [] }

    const teamsWithScores = leagueData.draft_picks
      .filter((pick: any) => pick.league_member_id === selectedMember.id)
      .map((pick: any) => {
        const team = pick.league_teams
        const globalTeam = team.global_teams
        const leagueSettings = leagueData.league_settings[0]

        const scores = [1, 2, 3, 4, 5, 6].map((round) => {
          const winScore = globalTeam[`round_${round}_win`] ? leagueSettings[`round_${round}_score`] : 0
          const upsetScore = globalTeam[`round_${round}_upset`]
            ? globalTeam[`round_${round}_upset`] * leagueSettings.upset_multiplier
            : 0
          return winScore + upsetScore
        })

        const totalScore = scores.reduce((sum, score) => sum + score, 0)
        return { ...team, scores, totalScore }
      })

    return { leagueMember: selectedMember, draftedTeams: teamsWithScores }
  }, [leagueData, selectedMemberId])

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load team data. Please try again.",
        variant: "destructive",
      })
    }
  }, [error, toast])
  const MAX_TEAM_NAME_LENGTH = 25

  const handleEditTeamName = () => {
    if (!leagueMember) return
    setNewTeamName(leagueMember.team_name || "")
    setIsEditingTeamName(true)
  }

  const handleSaveTeamName = async () => {
    if (!leagueMember) return

    // Trim the team name and check if it's empty or too long
    const trimmedName = newTeamName.trim()
    if (trimmedName.length === 0) {
      toast({
        title: "Error",
        description: "Team name cannot be empty.",
        variant: "destructive",
      })
      return
    }

    if (trimmedName.length > MAX_TEAM_NAME_LENGTH) {
      toast({
        title: "Error",
        description: `Team name must be ${MAX_TEAM_NAME_LENGTH} characters or less.`,
        variant: "destructive",
      })
      return
    }

    const result = await updateTeamName(leagueMember.id, trimmedName)
    if (result.success) {
      setIsEditingTeamName(false)
      refreshLeagueData()
      toast({
        title: "Team name updated",
        description: "Your team name has been successfully updated.",
      })
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to update team name. Please try again.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    if (draftedTeams.length > 0) {
      const checkImageUrls = async () => {
        const imagePromises = draftedTeams.map(async (team: any) => {
          if (team.global_teams.logo_filename) {
            const url = getLogoUrl(team.global_teams.logo_filename) || "/placeholder.svg"
            try {
              const response = await fetch(url, { method: "HEAD" })
              return response.ok
            } catch (error) {
              console.error(`Error checking image URL ${url}:`, error)
              return false
            }
          }
          return true
        })

        await Promise.all(imagePromises)
        setImagesLoaded(true)
      }

      checkImageUrls()
    }
  }, [draftedTeams])

  const sortedTeams = useMemo(() => {
    if (!sortConfig.key) return draftedTeams

    return [...draftedTeams].sort((a, b) => {
      if (sortConfig.key === "name") {
        return sortConfig.direction === "ascending" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
      }
      if (sortConfig.key === "seed") {
        return sortConfig.direction === "ascending"
          ? a.global_teams.seed - b.global_teams.seed
          : b.global_teams.seed - a.global_teams.seed
      }
      if (sortConfig.key.startsWith("round_")) {
        const roundIndex = Number.parseInt(sortConfig.key.split("_")[1]) - 1
        return sortConfig.direction === "ascending"
          ? a.scores[roundIndex] - b.scores[roundIndex]
          : b.scores[roundIndex] - a.scores[roundIndex]
      }
      if (sortConfig.key === "totalScore") {
        return sortConfig.direction === "ascending" ? a.totalScore - b.totalScore : b.totalScore - a.totalScore
      }
      return 0
    })
  }, [draftedTeams, sortConfig])

  const handleSort = (key: string) => {
    setSortConfig((prevConfig) => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === "ascending" ? "descending" : "ascending",
    }))
  }

  if (isLoading) {
    return <Skeleton className="h-[600px] w-full" />
  }

  if (error || !leagueMember) {
    return null
  }

  const getLogoUrl = (filename: string | null) => {
    return filename ? `/images/team-logos/${filename}` : null
  }

  return (
    <Card className="w-full">
      <CardHeader className="space-y-4 p-4 sm:px-6 sm:pb-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4 pb-4 sm:pb-0">
          <div className="flex flex-col items-start gap-2">
            <div className="flex items-center gap-2">
              {isEditingTeamName ? (
                <>
                  <Input
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    className="text-xl sm:text-2xl font-bold"
                  />
                  <Button onClick={handleSaveTeamName} size="sm" variant="default">
                    Save
                  </Button>
                  <Button onClick={() => setIsEditingTeamName(false)} size="sm" variant="outline">
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <CardTitle className="text-xl sm:text-2xl font-bold whitespace-nowrap bg-gradient-to-r from-primary/90 to-primary bg-clip-text text-transparent">
                    {leagueMember?.team_name || leagueMember?.users.display_name || "User's Team"}
                  </CardTitle>
                  {leagueMember?.user_id === leagueData?.user_id && (
                    <Button
                      onClick={handleEditTeamName}
                      size="sm"
                      variant="link"
                      className="flex items-center gap-2"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                  )}
                </>
              )}
            </div>
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">
              Total Score: {draftedTeams.reduce((sum: any, team: any) => sum + team.totalScore, 0)}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full sm:w-[250px] justify-start font-medium border-2 hover:border-primary/50 transition-colors"
              >
                <span className="truncate">
                  {leagueMember?.team_name || leagueMember?.users.display_name || "Select Team"}
                </span>
                <ChevronDownIcon className="ml-auto h-4 w-4 shrink-0 opacity-50 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[250px]">
              {leagueData?.league_members.map((member: LeagueMember) => (
                <DropdownMenuItem
                  key={member.id}
                  onSelect={() => setSelectedMemberId(member.id)}
                  className="font-medium"
                >
                  {member.team_name || member.users.display_name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Cards view (visible only on mobile screens) */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {sortedTeams.map((team: any) => (
              <TeamCard key={team.id} team={team} getLogoUrl={getLogoUrl} leagueData={leagueData} />
            ))}
          </div>

          {/* Table view (visible from medium screens and up) */}
          <div className="hidden md:block overflow-x-auto">
            <div className="w-full min-w-[800px] whitespace-nowrap rounded-md border">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th
                      className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 w-[200px] cursor-pointer hover:bg-muted/30 transition-colors"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center">
                        Team
                        <SortIcon column="name" sortConfig={sortConfig} />
                      </div>
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 w-[120px] hover:bg-muted/30 transition-colors">
                      Status
                    </th>
                    {[1, 2, 3, 4, 5, 6].map((round) => (
                      <th
                        key={round}
                        className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 w-[100px] cursor-pointer hover:bg-muted/30 transition-colors"
                        onClick={() => handleSort(`round_${round}`)}
                      >
                        <div className="flex items-center">
                          R{round}
                          <SortIcon column={`round_${round}`} sortConfig={sortConfig} />
                        </div>
                      </th>
                    ))}
                    <th
                      className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 w-[100px] cursor-pointer hover:bg-muted/30 transition-colors"
                      onClick={() => handleSort("totalScore")}
                    >
                      <div className="flex items-center">
                        Total
                        <SortIcon column="totalScore" sortConfig={sortConfig} />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {sortedTeams.map((team: DraftedTeam) => (
                    <tr
                      key={team.id}
                      className={cn(
                        "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
                        team.global_teams.is_eliminated
                          ? "!bg-destructive/20 dark:!bg-destructive/50 hover:!bg-destructive/30 dark:hover:!bg-destructive/40 border-destructive/50"
                          : "even:bg-muted/5",
                      )}
                    >
                      <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "flex h-8 w-8 items-center justify-center rounded-full",
                              team.global_teams.is_eliminated ? "bg-destructive/10" : "bg-muted",
                            )}
                          >
                            {team.global_teams.logo_filename ? (
                              <Image
                                src={getLogoUrl(team.global_teams.logo_filename) || "/placeholder.svg"}
                                alt={`${team.name} logo`}
                                width={40}
                                height={40}
                                className={cn("object-contain", team.global_teams.is_eliminated && "opacity-50")}
                              />
                            ) : (
                              <Trophy
                                className={cn(
                                  "h-4 w-4",
                                  team.global_teams.is_eliminated ? "text-destructive" : "text-primary",
                                )}
                              />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className={cn("font-medium", team.global_teams.is_eliminated && "text-destructive")}>
                              {team.name}
                            </span>
                            <span className="text-xs text-muted-foreground">Seed #{team.global_teams.seed}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                        {team.global_teams.is_eliminated ? (
                          <span className="inline-flex items-center rounded-full bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive dark:bg-slate-300">
                            <X className="mr-1 h-3 w-3" />
                            Eliminated
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                            <CheckIcon className="mr-1 h-3 w-3" />
                            Active
                          </span>
                        )}
                      </td>
                      {team.scores.map((score: number, index: number) => (
                        <td key={index} className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                          {score !== 0 ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center justify-center cursor-pointer">
                                    <span>{score}</span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {leagueData ? (
                                    <>
                                      <p>Win: {leagueData.league_settings[0][`round_${index + 1}_score`]}</p>
                                      <p>Upset: {score - leagueData.league_settings[0][`round_${index + 1}_score`]}</p>
                                    </>
                                  ) : (
                                    <p>Score details unavailable</p>
                                  )}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <div className="flex items-center justify-center">
                              <span>{score}</span>
                            </div>
                          )}
                        </td>
                      ))}
                      <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 font-bold bg-primary/5">
                        {team.totalScore}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function TeamCard({
  team,
  getLogoUrl,
  leagueData,
}: {
  team: DraftedTeam
  getLogoUrl: (filename: string | null) => string | null
  leagueData: any
}) {
  return (
    <Card
      className={cn(
        "transition-colors cursor-pointer hover:bg-muted/50",
        team.global_teams.is_eliminated &&
          "bg-destructive/20 dark:bg-destructive/50 hover:bg-destructive/30 dark:hover:bg-destructive/40 border-destructive/50",
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full",
                team.global_teams.is_eliminated ? "bg-destructive/10" : "bg-muted",
              )}
            >
              {team.global_teams.logo_filename ? (
                <Image
                  src={getLogoUrl(team.global_teams.logo_filename) || "/placeholder.svg"}
                  alt={`${team.name} logo`}
                  width={40}
                  height={40}
                  className={cn("object-contain", team.global_teams.is_eliminated && "opacity-50")}
                  priority
                />
              ) : (
                <Trophy
                  className={cn("h-6 w-6", team.global_teams.is_eliminated ? "text-destructive" : "text-primary")}
                />
              )}
            </div>
            <div>
              <div
                className={cn(
                  "font-semibold flex items-center gap-2",
                  team.global_teams.is_eliminated && "text-destructive",
                )}
              >
                {team.name}
              </div>
              <div className="text-sm text-muted-foreground">Seed: {team.global_teams.seed}</div>
            </div>
          </div>
          {team.global_teams.is_eliminated ? (
            <span className="text-xs bg-destructive dark:text-destructive text-destructive-foreground px-1.5 py-0.5 rounded-full flex items-center dark:bg-slate-300">
              <X className="w-3 h-3 mr-1" />
              Eliminated
            </span>
          ) : (
            <span className="text-xs bg-green-500 text-white px-1.5 py-0.5 rounded-full flex items-center"><CheckIcon className="w-3 h-3 mr-1"/>Active</span>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {team.scores.map((score, index) => (
            <div key={index} className="flex flex-col items-center justify-center">
              <div className="text-xs text-muted-foreground mb-1">R{index + 1}</div>
              {score !== 0 ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg font-medium text-xs sm:text-sm",
                          team.global_teams.is_eliminated ? "bg-destructive/10 text-destructive" : "bg-muted",
                        )}
                      >
                        {score}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      {leagueData ? (
                        <>
                          <p>Win: {leagueData.league_settings[0][`round_${index + 1}_score`]}</p>
                          <p>Upset: {score - leagueData.league_settings[0][`round_${index + 1}_score`]}</p>
                        </>
                      ) : (
                        <p>Score details unavailable</p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <div
                  className={cn(
                    "flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg font-medium text-xs sm:text-sm",
                    team.global_teams.is_eliminated ? "bg-destructive/10 text-destructive" : "bg-muted",
                  )}
                >
                  {score}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-center justify-center">
            <div className="text-xs text-muted-foreground mb-1">Total</div>
            <div
              className={cn(
                "flex h-8 sm:h-10 min-w-[3rem] sm:min-w-[4rem] items-center justify-center rounded-lg font-semibold px-2 sm:px-3 text-sm sm:text-base",
                team.global_teams.is_eliminated ? "bg-muted text-destructive dark:text-primary" : "bg-primary/10 text-primary",
              )}
            >
              {team.totalScore}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function SortIcon({ column, sortConfig }: { column: string; sortConfig: SortConfig }) {
  if (sortConfig.key !== column) {
    return <ChevronsUpDown className="ml-2 h-4 w-4 text-muted-foreground" />
  }
  return sortConfig.direction === "ascending" ? (
    <ChevronUp className="ml-2 h-4 w-4" />
  ) : (
    <ChevronDown className="ml-2 h-4 w-4" />
  )
}


"use client"

import { useMemo } from "react"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { cn } from "@/lib/utils"

type GlobalTeam = {
  id: string
  name: string
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

type LeagueMember = {
  id: string
  team_name: string
}

type LeagueSettings = {
  round_1_score: number
  round_2_score: number
  round_3_score: number
  round_4_score: number
  round_5_score: number
  round_6_score: number
  upset_multiplier: number
}

type LeagueData = {
  draft_picks: Array<{
    id: string
    league_member_id: string
    league_teams: {
      name: string
      global_teams: GlobalTeam
    }
  }>
  league_settings: LeagueSettings[]
  league_members: LeagueMember[]
}

export function AllTeams({ leagueData }: { leagueData: LeagueData | null }) {
  const allTeams = useMemo(() => {
    if (!leagueData?.draft_picks || !Array.isArray(leagueData.draft_picks)) return []

    const leagueSettings: Partial<LeagueSettings> = leagueData.league_settings?.[0] || {}
    const teamOwners: { [key: string]: LeagueMember } = {}

    leagueData.draft_picks.forEach((pick) => {
      teamOwners[pick.league_teams.global_teams.id] =
        leagueData.league_members?.find((member) => member.id === pick.league_member_id) || null
    })

    return leagueData.draft_picks
      .map((pick) => {
        const globalTeam = pick.league_teams.global_teams
        const roundScores = [1, 2, 3, 4, 5, 6].map((round) => {
          const winKey = `round_${round}_win` as keyof GlobalTeam
          const upsetKey = `round_${round}_upset` as keyof GlobalTeam
          const scoreKey = `round_${round}_score` as keyof LeagueSettings

          const winScore = globalTeam[winKey] ? leagueSettings[scoreKey] || 0 : 0
          const upsetScore = globalTeam[upsetKey]
            ? ((globalTeam[upsetKey] as number) || 0) * (leagueSettings.upset_multiplier || 1)
            : 0
          return winScore + upsetScore
        })

        const totalScore = roundScores.reduce((sum, score) => sum + score, 0)

        return {
          ...globalTeam,
          name: pick.league_teams.name,
          owner: teamOwners[globalTeam.id] || null,
          roundScores,
          totalScore,
        }
      })
      .sort((a, b) => b.totalScore - a.totalScore)
  }, [leagueData])

  const getLogoUrl = (filename: string | null) => {
    return filename ? `/images/team-logos/${filename}` : null
  }

  if (!leagueData?.draft_picks || leagueData.draft_picks.length === 0) {
    return <div className="text-center py-4">No team data available.</div>
  }

  return (
    <div className="w-full">
      {/* Mobile view */}
      <div className="md:hidden space-y-4">
        {allTeams.map((team, index) => (
          <Card key={team.id} className={cn(team.is_eliminated && "bg-destructive/10")}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-lg">{index + 1}</span>
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full",
                      team.is_eliminated ? "bg-destructive/10" : "bg-muted",
                    )}
                  >
                    {team.logo_filename ? (
                      <Image
                        src={getLogoUrl(team.logo_filename) || "/placeholder.svg"}
                        alt={`${team.name} logo`}
                        width={32}
                        height={32}
                        className={cn("object-contain", team.is_eliminated && "opacity-50")}
                      />
                    ) : (
                      <span className="text-xs font-semibold">{team.name.substring(0, 2)}</span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className={cn("font-medium", team.is_eliminated && "text-destructive")}>{team.name}</span>
                    <span className="text-xs text-muted-foreground">Seed #{team.seed}</span>
                  </div>
                </div>
                <span className="font-bold text-primary text-lg">{team.totalScore}</span>
              </div>
              <div className="text-sm mb-2">
                Owner:{" "}
                {team.owner ? (
                  <span className="text-primary">{team.owner.team_name}</span>
                ) : (
                  <span className="text-muted-foreground">Undrafted</span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {team.roundScores.map((score, index) => (
                  <TooltipProvider key={index}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="text-center p-2 bg-muted rounded-md">
                          <div className="text-xs text-muted-foreground mb-1">
                            {index === 2
                              ? "Sweet 16"
                              : index === 3
                                ? "Elite 8"
                                : index === 4
                                  ? "Final 4"
                                  : index === 5
                                    ? "Finals"
                                    : `R${index + 1}`}
                          </div>
                          <span className={cn("text-sm", score > 0 && "font-semibold text-primary")}>{score}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Win:{" "}
                          {team[`round_${index + 1}_win` as keyof GlobalTeam]
                            ? leagueData.league_settings?.[0]?.[`round_${index + 1}_score` as keyof LeagueSettings] || 0
                            : 0}
                        </p>
                        <p>
                          Upset:{" "}
                          {team[`round_${index + 1}_upset` as keyof GlobalTeam]
                            ? ((team[`round_${index + 1}_upset` as keyof GlobalTeam] as number) || 0) *
                              (leagueData.league_settings?.[0]?.upset_multiplier || 1)
                            : 0}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop view */}
      <div className="hidden md:block">
        <ScrollArea className="w-full whitespace-nowrap rounded-md border">
          <div className="w-full">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b sticky top-0 bg-background z-10">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 w-[100px]">
                    Rank
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                    Team
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                    Owner
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 w-[100px]">
                    R1
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 w-[100px]">
                    R2
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 w-[100px]">
                    Sweet 16
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 w-[100px]">
                    Elite 8
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 w-[100px]">
                    Final 4
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 w-[100px]">
                    Finals
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 w-[100px]">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {allTeams.map((team, index) => (
                  <tr
                    key={team.id}
                    className={cn(
                      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
                      team.is_eliminated && "bg-destructive/10 hover:bg-destructive/20",
                    )}
                  >
                    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                      <span className="font-medium">{index + 1}</span>
                    </td>
                    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-full",
                            team.is_eliminated ? "bg-destructive/10" : "bg-muted",
                          )}
                        >
                          {team.logo_filename ? (
                            <Image
                              src={getLogoUrl(team.logo_filename) || "/placeholder.svg"}
                              alt={`${team.name} logo`}
                              width={32}
                              height={32}
                              className={cn("object-contain", team.is_eliminated && "opacity-50")}
                            />
                          ) : (
                            <span className="text-xs font-semibold">{team.name.substring(0, 2)}</span>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className={cn("font-medium", team.is_eliminated && "text-destructive")}>
                            {team.name}
                          </span>
                          <span className="text-xs text-muted-foreground">Seed #{team.seed}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                      {team.owner ? (
                        <span className="text-primary">{team.owner.team_name}</span>
                      ) : (
                        <span className="text-muted-foreground">Undrafted</span>
                      )}
                    </td>
                    {team.roundScores.map((score, index) => (
                      <td key={index} className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className={cn("cursor-help", score > 0 && "font-semibold text-primary")}>
                                {score}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                Win:{" "}
                                {team[`round_${index + 1}_win` as keyof GlobalTeam]
                                  ? leagueData.league_settings?.[0]?.[
                                      `round_${index + 1}_score` as keyof LeagueSettings
                                    ] || 0
                                  : 0}
                              </p>
                              <p>
                                Upset:{" "}
                                {team[`round_${index + 1}_upset` as keyof GlobalTeam]
                                  ? ((team[`round_${index + 1}_upset` as keyof GlobalTeam] as number) || 0) *
                                    (leagueData.league_settings?.[0]?.upset_multiplier || 1)
                                  : 0}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </td>
                    ))}
                    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 font-bold text-primary">
                      {team.totalScore}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  )
}


"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Trophy, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useLeague } from "@/app/context/LeagueContext"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import Image from "next/image"

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
    is_eliminated: boolean
  }
  scores: number[]
  totalScore: number
}

export function LeagueTeam() {
  const { leagueData, isLoading, error } = useLeague()
  const { toast } = useToast()

  const { leagueMember, draftedTeams } = useMemo(() => {
    if (!leagueData) return { leagueMember: null, draftedTeams: [] }

    const currentUser = leagueData.league_members.find((member: any) => member.user_id === leagueData.user_id)
    if (!currentUser) return { leagueMember: null, draftedTeams: [] }

    const teamsWithScores = leagueData.draft_picks
      .filter((pick: any) => pick.league_member_id === currentUser.id)
      .map((pick: any) => {
        const team = pick.league_teams
        const globalTeam = team.global_teams
        const leagueSettings = leagueData.league_settings[0]

        const scores = [1, 2, 3, 4, 5, 6].map((round) =>
          globalTeam[`round_${round}_win`] ? leagueSettings[`round_${round}_score`] : 0,
        )

        const totalScore = scores.reduce((sum, score) => sum + score, 0)
        return { ...team, scores, totalScore }
      })

    return { leagueMember: currentUser, draftedTeams: teamsWithScores }
  }, [leagueData])

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load team data. Please try again.",
        variant: "destructive",
      })
    }
  }, [error, toast])

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
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-bold">
          {leagueMember?.team_name || leagueMember?.users.display_name || "User's Team"}
        </CardTitle>
        <Avatar className="h-12 w-12">
          <AvatarImage src={leagueMember?.avatar_url || undefined} alt={leagueMember?.users.display_name || "User"} />
          <AvatarFallback>{leagueMember?.users.display_name?.[0] || "U"}</AvatarFallback>
        </Avatar>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Mobile view */}
          <div className="md:hidden space-y-4">
            {draftedTeams.map((team: any) => (
              <TeamCard key={team.id} team={team} getLogoUrl={getLogoUrl} />
            ))}
          </div>

          {/* Desktop view */}
          <div className="hidden md:block">
            <ScrollArea className="w-full whitespace-nowrap rounded-md border">
              <div className="w-full">
                <table className="w-full caption-bottom text-sm">
                  <thead className="[&_tr]:border-b">
                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 w-[200px]">
                        Team
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 w-[100px]">
                        Seed
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 w-[100px]">
                        R1
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 w-[100px]">
                        R2
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 w-[100px]">
                        R3
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 w-[100px]">
                        R4
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 w-[100px]">
                        R5
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 w-[100px]">
                        R6
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 w-[100px]">
                        Total
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 w-[120px]">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {draftedTeams.map((team: any) => (
                      <tr
                        key={team.id}
                        className={cn(
                          "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
                          team.global_teams.is_eliminated && "bg-destructive/10",
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
                            <span className={cn(team.global_teams.is_eliminated && "text-destructive")}>
                              {team.name}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">{team.global_teams.seed}</td>
                        {team.scores.map((score: any, index: any) => (
                          <td key={index} className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                            {score}
                          </td>
                        ))}
                        <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 font-bold">{team.totalScore}</td>
                        <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                          {team.global_teams.is_eliminated ? (
                            <span className="text-xs bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded-full inline-flex items-center">
                              <X className="w-3 h-3 mr-1" />
                              Eliminated
                            </span>
                          ) : (
                            <span className="text-xs bg-green-500 text-white px-1.5 py-0.5 rounded-full">Active</span>
                          )}
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
      </CardContent>
    </Card>
  )
}

function TeamCard({ team, getLogoUrl }: { team: DraftedTeam; getLogoUrl: (filename: string | null) => string | null }) {
  return (
    <Card className={cn(team.global_teams.is_eliminated && "bg-destructive/10")}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4 mb-4">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full",
              team.global_teams.is_eliminated ? "bg-destructive/10" : "bg-muted",
            )}
          >
            {team.global_teams.logo_filename ? (
              <img
                src={getLogoUrl(team.global_teams.logo_filename) || "/placeholder.svg"}
                alt={`${team.name} logo`}
                className={cn("h-10 w-10 object-contain", team.global_teams.is_eliminated && "opacity-50")}
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
        <div className="grid grid-cols-3 gap-2 mb-4">
          {team.scores.map((score, index) => (
            <div key={index} className="flex flex-col items-center justify-center">
              <div className="text-xs text-muted-foreground mb-1">R{index + 1}</div>
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg font-medium",
                  team.global_teams.is_eliminated ? "bg-destructive/10 text-destructive" : "bg-muted",
                )}
              >
                {score}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-center justify-center">
            <div className="text-xs text-muted-foreground mb-1">Total</div>
            <div
              className={cn(
                "flex h-10 min-w-[4rem] items-center justify-center rounded-lg font-semibold px-3",
                team.global_teams.is_eliminated ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary",
              )}
            >
              {team.totalScore}
            </div>
          </div>
          {team.global_teams.is_eliminated ? (
            <span className="text-xs bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded-full flex items-center">
              <X className="w-3 h-3 mr-1" />
              Eliminated
            </span>
          ) : (
            <span className="text-xs bg-green-500 text-white px-1.5 py-0.5 rounded-full">Active</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}


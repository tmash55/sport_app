"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"
import { useLeague } from "@/app/context/LeagueContext"
import { Card } from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Medal } from "lucide-react"
import { AllTeams } from "./AllTeams"

type LeagueMember = {
  id: string
  user_id: string
  team_name: string
  total_score: number
  round_1_score: number
  round_2_score: number
  round_3_score: number
  round_4_score: number
  round_5_score: number
  round_6_score: number
  teams_remaining: number
  round_1_upset: number
  round_2_upset: number
  round_3_upset: number
  round_4_upset: number
  round_5_upset: number
  round_6_upset: number
}

export function LeagueStandings() {
  const { leagueData, isLoading, error } = useLeague()

  const processedLeagueMembers = useMemo(() => {
    if (!leagueData) return []

    const leagueSettings = leagueData.league_settings?.[0] || {}

    return leagueData.league_members.map((member: any) => {
      const memberDraftPicks = leagueData.draft_picks.filter((pick: any) => pick.league_member_id === member.id)

      const teamsRemaining = memberDraftPicks.filter(
        (pick: any) => !pick.league_teams.global_teams.is_eliminated,
      ).length

      const roundScores = [1, 2, 3, 4, 5, 6].map((round) => {
        return memberDraftPicks.reduce((sum: number, pick: any) => {
          const teamWon = pick.league_teams.global_teams[`round_${round}_win`]
          const roundScore = leagueSettings[`round_${round}_score`] || 0
          const upsetScore = pick.league_teams.global_teams[`round_${round}_upset`] || 0
          return teamWon ? sum + roundScore + upsetScore * leagueSettings.upset_multiplier : sum
        }, 0)
      })

      const roundUpsets = [1, 2, 3, 4, 5, 6].map((round) => {
        return memberDraftPicks.reduce((sum: number, pick: any) => {
          const upsetScore = pick.league_teams.global_teams[`round_${round}_upset`] || 0
          return sum + upsetScore * leagueSettings.upset_multiplier
        }, 0)
      })

      const totalScore = roundScores.reduce((sum, score) => sum + score, 0)

      return {
        ...member,
        teams_remaining: teamsRemaining,
        round_1_score: roundScores[0],
        round_2_score: roundScores[1],
        round_3_score: roundScores[2],
        round_4_score: roundScores[3],
        round_5_score: roundScores[4],
        round_6_score: roundScores[5],
        round_1_upset: roundUpsets[0],
        round_2_upset: roundUpsets[1],
        round_3_upset: roundUpsets[2],
        round_4_upset: roundUpsets[3],
        round_5_upset: roundUpsets[4],
        round_6_upset: roundUpsets[5],
        total_score: totalScore,
      }
    })
  }, [leagueData])

  const sortedLeagueMembers = useMemo(() => {
    return [...processedLeagueMembers].sort((a, b) => b.total_score - a.total_score)
  }, [processedLeagueMembers])

  if (isLoading) return <div className="text-center py-4">Loading standings...</div>
  if (error) return <div className="text-center py-4 text-red-500">Error loading standings: {error.message}</div>

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">League Standings</h2>
      <Tabs defaultValue="members" className="w-full">
        <TabsList>
          <TabsTrigger value="members">League Rankings</TabsTrigger>
          <TabsTrigger value="allTeams">Team Performance</TabsTrigger>
        </TabsList>
        <TabsContent value="members">
          {sortedLeagueMembers.length === 0 ? (
            <p className="text-center py-4">No standings data available.</p>
          ) : (
            <>
              {/* Mobile view */}
              <div className="md:hidden space-y-4">
                {sortedLeagueMembers.map((member, index) => (
                  <StandingsCard
                    key={member.id}
                    member={member}
                    rank={index + 1}
                    isCurrentUser={member.user_id === leagueData?.user_id}
                  />
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
                            Position
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                            Team Name
                          </th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 w-[150px]">
                            Teams Active
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
                        {sortedLeagueMembers.map((member, index) => {
                          const isCurrentUser = member.user_id === leagueData?.user_id
                          return (
                            <tr
                              key={member.id}
                              className={cn(
                                "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
                                isCurrentUser && "bg-primary/5 dark:bg-primary/10",
                              )}
                            >
                              <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                                <div className="flex items-center gap-2">
                                  {index === 0 ? (
                                    <Trophy className="h-5 w-5 text-yellow-500" />
                                  ) : index === 1 ? (
                                    <Medal className="h-5 w-5 text-gray-400" />
                                  ) : index === 2 ? (
                                    <Medal className="h-5 w-5 text-amber-600" />
                                  ) : (
                                    <span className="font-medium">{index + 1}</span>
                                  )}
                                </div>
                              </td>
                              <td
                                className={cn(
                                  "p-4 align-middle [&:has([role=checkbox])]:pr-0",
                                  isCurrentUser && "font-bold text-primary",
                                )}
                              >
                                {member.team_name}
                                {isCurrentUser && <span className="ml-2 text-xs">(You)</span>}
                              </td>
                              <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                                <div
                                  className={cn(
                                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                                    member.teams_remaining === 0
                                      ? "bg-destructive/10 text-destructive"
                                      : "bg-primary/10 text-primary",
                                  )}
                                >
                                  {member.teams_remaining} Teams
                                </div>
                              </td>
                              {[1, 2, 3, 4, 5, 6].map((round) => (
                                <td key={round} className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span
                                          className={cn(
                                            "cursor-help",
                                            member[`round_${round}_score` as keyof LeagueMember] > 0 &&
                                              "font-semibold text-primary",
                                          )}
                                        >
                                          {member[`round_${round}_score` as keyof LeagueMember]}
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>
                                          Win:{" "}
                                          {(member[`round_${round}_score` as keyof LeagueMember] as number) -
                                            (member[`round_${round}_upset` as keyof LeagueMember] as number)}
                                        </p>
                                        <p>Upset: {member[`round_${round}_upset` as keyof LeagueMember]}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </td>
                              ))}
                              <td
                                className={cn(
                                  "p-4 align-middle [&:has([role=checkbox])]:pr-0 font-bold",
                                  isCurrentUser && "text-primary",
                                )}
                              >
                                {member.total_score}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </div>
            </>
          )}
        </TabsContent>
        <TabsContent value="allTeams">
          <AllTeams leagueData={leagueData} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function StandingsCard({
  member,
  rank,
  isCurrentUser,
}: {
  member: LeagueMember
  rank: number
  isCurrentUser: boolean
}) {
  return (
    <Card className={cn(isCurrentUser && "bg-primary/5 dark:bg-primary/10")}>
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            {rank === 1 ? (
              <Trophy className="h-5 w-5 text-yellow-500" />
            ) : rank === 2 ? (
              <Medal className="h-5 w-5 text-gray-400" />
            ) : rank === 3 ? (
              <Medal className="h-5 w-5 text-amber-600" />
            ) : (
              <span className="font-medium">#{rank}</span>
            )}
            <h3 className={cn("text-lg", isCurrentUser && "font-bold text-primary")}>{member.team_name}</h3>
          </div>
          <span className={cn("text-lg font-bold", isCurrentUser && "text-primary")}>{member.total_score} pts</span>
        </div>
        <div
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 mb-3",
            member.teams_remaining === 0 ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary",
          )}
        >
          {member.teams_remaining} Teams Active
        </div>
        <div className="grid grid-cols-3 gap-2 text-sm">
          {[
            { round: 1, label: "R1" },
            { round: 2, label: "R2" },
            { round: 3, label: "Sweet 16" },
            { round: 4, label: "Elite 8" },
            { round: 5, label: "Final 4" },
            { round: 6, label: "Finals" },
          ].map(({ round, label }) => (
            <TooltipProvider key={round}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-col items-center p-2 rounded-md bg-muted/50 cursor-help">
                    <span className="text-xs text-muted-foreground">{label}</span>
                    <span
                      className={cn(
                        member[`round_${round}_score` as keyof LeagueMember] as number > 0 && "font-semibold text-primary",
                      )}
                    >
                      {member[`round_${round}_score` as keyof LeagueMember] as number}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Win:{" "}
                    {(member[`round_${round}_score` as keyof LeagueMember] as number) -
                      (member[`round_${round}_upset` as keyof LeagueMember] as number)}
                  </p>
                  <p>Upset: {member[`round_${round}_upset` as keyof LeagueMember]}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </div>
    </Card>
  )
}


"use client"

import React, { useMemo } from "react"
import { cn } from "@/lib/utils"
import { useLeague } from "@/app/context/LeagueContext"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

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
          return teamWon ? sum + roundScore : sum
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
                  <thead className="[&_tr]:border-b">
                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 w-[100px]">
                        Rank
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                        Team Name
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 w-[150px]">
                        Teams Remaining
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 w-[100px]">
                        Round 1
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 w-[100px]">
                        Round 2
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 w-[100px]">
                        Round 3
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 w-[100px]">
                        Round 4
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 w-[100px]">
                        Round 5
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 w-[100px]">
                        Round 6
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
                          <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 font-medium">{index + 1}</td>
                          <td
                            className={cn(
                              "p-4 align-middle [&:has([role=checkbox])]:pr-0",
                              isCurrentUser && "font-bold text-primary",
                            )}
                          >
                            {member.team_name}
                            {isCurrentUser && <span className="ml-2 text-xs">(You)</span>}
                          </td>
                          <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">{member.teams_remaining}</td>
                          <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">{member.round_1_score}</td>
                          <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">{member.round_2_score}</td>
                          <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">{member.round_3_score}</td>
                          <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">{member.round_4_score}</td>
                          <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">{member.round_5_score}</td>
                          <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">{member.round_6_score}</td>
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
    </div>
  )
}

function StandingsCard({
  member,
  rank,
  isCurrentUser,
}: { member: LeagueMember; rank: number; isCurrentUser: boolean }) {
  return (
    <Card className={cn(isCurrentUser && "bg-primary/5 dark:bg-primary/10")}>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-lg font-bold">Rank: {rank}</span>
          <span className={cn("text-lg font-bold", isCurrentUser && "text-primary")}>Total: {member.total_score}</span>
        </div>
        <h3 className={cn("text-lg mb-2", isCurrentUser && "font-bold text-primary")}>
          {member.team_name}
          {isCurrentUser && <span className="ml-2 text-xs">(You)</span>}
        </h3>
        <p className="text-sm mb-2">Teams Remaining: {member.teams_remaining}</p>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div>R1: {member.round_1_score}</div>
          <div>R2: {member.round_2_score}</div>
          <div>R3: {member.round_3_score}</div>
          <div>R4: {member.round_4_score}</div>
          <div>R5: {member.round_5_score}</div>
          <div>R6: {member.round_6_score}</div>
        </div>
      </CardContent>
    </Card>
  )
}


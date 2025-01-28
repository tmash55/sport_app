"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { DraftOrderManager } from "@/components/leagues/DraftOrderManager"
import { useLeague } from "@/app/context/LeagueContext"
import { Skeleton } from "@/components/ui/skeleton"

interface User {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  display_name: string | null
}

interface LeagueMember {
  user_id: string | null
  draft_position: number | null
  users: User | null
  team_name: string | null
}

export function LeagueOverview() {
  const { leagueData, isLoading, error } = useLeague()
  const { toast } = useToast()
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load league details",
        variant: "destructive",
      })
    }
  }, [error, toast])

  useEffect(() => {
    if (leagueData) {
      setCurrentUserId(leagueData.user_id)
    }
  }, [leagueData])

  const { leagueDetails, leagueSettings, users, commissioner, isCommissioner, maxTeams } = useMemo(() => {
    if (!leagueData) {
      return {
        leagueDetails: null,
        leagueSettings: null,
        users: [],
        commissioner: null,
        isCommissioner: false,
        maxTeams: 0,
      }
    }

    const leagueSettings = leagueData.league_settings[0]
    const users = leagueData.league_members
    const commissioner = leagueData.commissioner
    const isCommissioner = currentUserId === commissioner.id
    const maxTeams = leagueSettings.max_teams

    return {
      leagueDetails: leagueData,
      leagueSettings,
      users,
      commissioner,
      isCommissioner,
      maxTeams,
    }
  }, [leagueData, currentUserId])

  if (isLoading) {
    return <Skeleton className="h-[600px] w-full" />
  }

  if (error || !leagueDetails || !leagueSettings) {
    return null
  }

  // Separate assigned and unassigned teams
  const assignedMembers = users.filter((member) => member.user_id !== null)
  const unassignedMembers: LeagueMember[] = Array.from({ length: maxTeams - assignedMembers.length }, (_, index) => ({
    team_name: `Team ${assignedMembers.length + index + 1}`,
    user_id: null,
    draft_position: null,
    users: null,
  }))

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">League Overview</h2>
        {isCommissioner && (
          <DraftOrderManager leagueId={leagueDetails.id} maxTeams={maxTeams} onOrderUpdated={() => {}} />
        )}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              League Members ({assignedMembers.length}/{maxTeams})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {assignedMembers.map((member, index) => (
                <li key={member.user_id || index} className="flex items-start p-2 bg-secondary/50 rounded-md">
                  <span className="font-semibold mr-2 mt-1 w-6 text-right">{index + 1}.</span>
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex items-baseline">
                      <span className="font-medium">{member.team_name || member.users?.email || "Unnamed Team"}</span>
                      {member.users?.display_name && (
                        <span className="text-sm text-muted-foreground ml-2">{member.users.display_name}</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      {member.user_id === commissioner.id && <Badge variant="outline">Commissioner</Badge>}
                    </div>
                  </div>
                </li>
              ))}
              {unassignedMembers.map((member, index) => (
                <li key={`unassigned-${index}`} className="flex items-start p-2 bg-secondary/20 rounded-md">
                  <span className="font-semibold mr-2 mt-1 w-6 text-right">{assignedMembers.length + index + 1}.</span>
                  <div className="flex-1 text-muted-foreground">{member.team_name}</div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>League Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Number of Teams: {maxTeams}</p>
            <p>Round 1 Score: {leagueSettings.round_1_score}</p>
            <p>Round 2 Score: {leagueSettings.round_2_score}</p>
            <p>Round 3 Score: {leagueSettings.round_3_score}</p>
            <p>Round 4 Score: {leagueSettings.round_4_score}</p>
            <p>Round 5 Score: {leagueSettings.round_5_score}</p>
            <p>Round 6 Score: {leagueSettings.round_6_score}</p>
            <p>Upset Multiplier: {leagueSettings.upset_multiplier}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useLeague } from "@/app/context/LeagueContext"

interface LeagueMember {
  id: string
  user_id: string
  draft_position: number | null
  team_name: string
  users: {
    display_name: string | null
    email: string
  }
}

interface LeagueSettings {
  max_teams: number
  round_1_score: number
  round_2_score: number
  round_3_score: number
  round_4_score: number
  round_5_score: number
  round_6_score: number
  upset_multiplier: number
}

export function LeagueDraft() {
  const router = useRouter()
  const { leagueData, isLoading, error } = useLeague()
  const [isDraftOrderSet, setIsDraftOrderSet] = useState(false)
  

  useEffect(() => {
    if (leagueData) {
      const allMembersHaveDraftPosition = leagueData.league_members.every((member: any) => member.draft_position !== null)
      setIsDraftOrderSet(allMembersHaveDraftPosition)
    }
  }, [leagueData])

  const handleButtonClick = () => {
    if (isDraftOrderSet && leagueData) {
      router.push(`/draft/${leagueData.id}`)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-32" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-64" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-4" />
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
    )
  }

  if (error || !leagueData) {
    return (
      <Card>
        <CardContent>
          <p>Error loading league data. Please try again later.</p>
        </CardContent>
      </Card>
    )
  }

  

  return (
    <Card className="w-full">
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">League Members</h3>
          <div className="rounded-md border">
            {leagueData.league_members.map((member: any, index: any) => (
              <div key={member.id} className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-4">
                  <span className="font-medium">{index + 1}.</span>
                  <div>
                    <p className="font-medium">{member.team_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {member.users?.display_name || member.users?.email || ""}
                    </p>
                  </div>
                </div>
                {member.draft_position && <Badge variant="secondary">Draft #{member.draft_position}</Badge>}
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">League Settings and Scoring</h3>
          {leagueData.league_settings && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Max Teams:</p>
                <p>{leagueData.league_settings[0].max_teams}</p>
              </div>
              <div>
                <p className="font-medium">Upset Multiplier:</p>
                <p>{leagueData.league_settings[0].upset_multiplier}</p>
              </div>
              <div>
                <p className="font-medium">Round 1 Score:</p>
                <p>{leagueData.league_settings[0].round_1_score}</p>
              </div>
              <div>
                <p className="font-medium">Round 2 Score:</p>
                <p>{leagueData.league_settings[0].round_2_score}</p>
              </div>
              <div>
                <p className="font-medium">Round 3 Score:</p>
                <p>{leagueData.league_settings[0].round_3_score}</p>
              </div>
              <div>
                <p className="font-medium">Round 4 Score:</p>
                <p>{leagueData.league_settings[0].round_4_score}</p>
              </div>
              <div>
                <p className="font-medium">Round 5 Score:</p>
                <p>{leagueData.league_settings[0].round_5_score}</p>
              </div>
              <div>
                <p className="font-medium">Round 6 Score:</p>
                <p>{leagueData.league_settings[0].round_6_score}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}


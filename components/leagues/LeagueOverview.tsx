"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { DraftOrderManager } from "@/components/leagues/DraftOrderManager"
import { useLeague } from "@/app/context/LeagueContext"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Trophy, Users, Settings, Hash, Book, ArrowRight } from "lucide-react"
import { Button } from "../ui/button"
import Link from "next/link"
import { LeagueSettingsDialog } from "./LeagueSettingsDialog"
import { cn } from "@/lib/utils"

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
  role: "commissioner" | "member"
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
    const userLeagueRole = leagueData.league_members.find(
      (member: LeagueMember) => member.user_id === currentUserId
    )?.role;
    
    const isCommissioner = userLeagueRole === "commissioner";
    
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
  const assignedMembers = users.filter((member: any) => member.user_id !== null)
  const unassignedMembers: LeagueMember[] = Array.from({ length: maxTeams - assignedMembers.length }, (_, index) => ({
    team_name: `Team ${assignedMembers.length + index + 1}`,
    user_id: null as string | null,
    draft_position: null as number | null,
    users: null as User | null,
    role: "member"
  }))
  const paymentStatus = leagueData.payment_status

  const roundScores = [
    { round: 1, score: leagueSettings.round_1_score },
    { round: 2, score: leagueSettings.round_2_score },
    { round: 3, score: leagueSettings.round_3_score },
    { round: 4, score: leagueSettings.round_4_score },
    { round: 5, score: leagueSettings.round_5_score },
    { round: 6, score: leagueSettings.round_6_score },
  ]

  const isDraftCompleted = leagueDetails.drafts.status === "completed"
  console.log(leagueDetails)

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex items-center justify-between w-full sm:w-auto">
          <h1 className="text-3xl font-bold tracking-tight">{leagueDetails.name}</h1>
          
        </div>
       
      </div>

      <Tabs defaultValue="members" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="members" className="flex items-center justify-center">
            <Users className="w-4 h-4 mr-2" />
            Members
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex items-center justify-center">
            <Book className="w-4 h-4 mr-2" />
            Rules
          </TabsTrigger>
          <TabsTrigger value="scoring" className="flex items-center justify-center">
            <Trophy className="w-4 h-4 mr-2" />
            Scoring
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center justify-center">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Pool Members</CardTitle>
              <CardDescription>
                Teams participating in this pool ({assignedMembers.length}/{maxTeams})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <ul className="space-y-3">
                  {assignedMembers.map((member: LeagueMember, index: number) => (
                    <li
                      key={member.user_id || index}
                      className="flex flex-col p-3 bg-secondary/20 rounded-lg transition-colors hover:bg-secondary/30"
                    >
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-semibold text-muted-foreground">{index + 1}.</span>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">
                            {member.team_name || member.users?.email || "Unnamed Team"}
                          </span>
                          {member.role === "commissioner" && (
                            <Badge variant="secondary" className="whitespace-nowrap">
                              Commissioner
                            </Badge>
                          )}


                        </div>
                      </div>
                      {member.users?.display_name && (
                        <span className="text-sm text-muted-foreground ml-6">({member.users.display_name})</span>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2 ml-6">
                        {!isDraftCompleted && member.draft_position !== null && (
                          <Badge variant="outline" className="whitespace-nowrap">
                            Draft: #{member.draft_position}
                          </Badge>
                        )}
                      </div>
                    </li>
                  ))}
                  {unassignedMembers.map((member, index) => (
                    <li
                      key={`unassigned-${index}`}
                      className="flex items-baseline gap-2 p-3 bg-secondary/10 rounded-lg"
                    >
                      <span className="text-lg font-semibold text-muted-foreground">
                        {assignedMembers.length + index + 1}.
                      </span>
                      <span className="text-muted-foreground">{member.team_name}</span>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="rules">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">League Rules</CardTitle>
              <CardDescription>Official rules for the March Madness Draft Pool</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Pool Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p>
                        This pool follows a March Madness Draft format, where users draft college teams instead of
                        filling out a bracket.
                      </p>
                      <div className="flex justify-between items-center max-w-md">
                        <span>Pool Size:</span>
                        <Badge variant="secondary">4-12 members</Badge>
                      </div>
                      <div>
                        <p className="font-medium mb-2">Draft Format:</p>
                        <p>Every team in the tournament (64 teams) will be owned by a pool member.</p>
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                          <li>8 members → Each drafts 8 teams</li>
                          <li>6 members → Each drafts 10 teams</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium mb-2">Draft Timing:</p>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>The Pool Commissioner sets the draft time.</li>
                          <li>The draft will not start automatically—the Commissioner must manually start it.</li>
                        </ul>
                      </div>
                      <p>Each NCAAB team can only be drafted once, meaning no duplicate picks.</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Scoring & Points System</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p>
                        Teams earn points for each win they secure in the tournament. Points increase each round, making
                        deeper runs more valuable.
                      </p>
                      <div>
                        <p className="font-medium mb-2">Default scoring system:</p>
                        <ul className="space-y-2 max-w-md">
                          {[
                            { round: "Round 1", points: 1 },
                            { round: "Round 2", points: 2 },
                            { round: "Sweet 16 (Round 3)", points: 4 },
                            { round: "Elite 8 (Round 4)", points: 8 },
                            { round: "Final Four (Round 5)", points: 16 },
                            { round: "Championship (Round 6)", points: 16 },
                          ].map(({ round, points }) => (
                            <li key={round} className="flex items-center gap-4">
                              <span className="flex-1">{round}</span>
                              <Badge variant="secondary">
                                {points} point{points > 1 ? "s" : ""} per win
                              </Badge>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium mb-2">Upset Bonus:</p>
                        <p>
                          If a lower-seeded team beats a higher-seeded team, the team earns extra points based on the
                          seed difference.
                        </p>
                        <p className="mt-2">
                          Example: A #12 seed defeats a #5 seed → earns (12 - 5 = 7 upset points) + round win points.
                        </p>
                        <p className="mt-2">
                          The upset multiplier is set to 1 by default, but the Commissioner can adjust scoring rules
                          under the Scoring Settings tab.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>League Completion & Standings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p>The pool concludes after the Championship game, and final standings are updated.</p>
                      <p>Standings reflect total points accumulated throughout the tournament.</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Pool Creation & Access</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">Free</Badge>
                        <p className="font-medium">Creating a Pool</p>
                      </div>
                      <p>Members can create a pool and complete the draft at no cost.</p>
                      <div>
                        <p className="font-medium mb-2">Commissioner Payment Required for:</p>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>League standings</li>
                          <li>Scoring updates</li>
                          <li>Full pool details</li>
                        </ul>
                      </div>
                      <p>
                        The Pool Commissioner must make a payment before or after the draft to unlock these features.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="scoring">
          <Card>
          <CardHeader className="flex flex-row justify-between items-start">
            <div className="space-y-1">
              <CardTitle className="text-2xl">Scoring System</CardTitle>
              <CardDescription>Points awarded for each round and upset bonuses</CardDescription>
            </div>
            {isCommissioner && (
              <LeagueSettingsDialog leagueId={leagueDetails.id} isCommissioner={isCommissioner} defaultTab="scoring">
                <Button variant="outline" size="sm" className="gap-2 shrink-0">
                  <Settings className="h-4 w-4" />
                  <span>Edit Scoring</span>
                </Button>
              </LeagueSettingsDialog>
            )}
          </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Round Scores</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {roundScores.map(({ round, score }) => (
                        <li key={round} className="flex justify-between items-center p-2 bg-secondary/20 rounded-md">
                          <span className="font-medium">Round {round}</span>
                          <Badge variant="secondary">{score} points</Badge>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Upset Bonus</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      When a lower-seeded team defeats a higher-seeded team, additional points are awarded.
                    </p>
                    <div className="p-3 bg-secondary/20 rounded-md flex justify-between items-center">
                      <span className="font-medium">Upset Multiplier</span>
                      <Badge variant="secondary">{leagueSettings.upset_multiplier}x</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="settings">
          <Card>
          <CardHeader className="flex flex-row justify-between items-start pb-6">
            <div className="space-y-1">
              <CardTitle className="text-2xl">League Settings</CardTitle>
              <CardDescription>General settings for this league</CardDescription>
            </div>
            {isCommissioner && (
              <LeagueSettingsDialog leagueId={leagueDetails.id} isCommissioner={isCommissioner} defaultTab="general">
                <Button variant="outline" size="sm" className="gap-2 shrink-0">
                  <Settings className="h-4 w-4" />
                  <span>Edit Settings</span>
                </Button>
              </LeagueSettingsDialog>
            )}
          </CardHeader>
            <CardContent>
              <ul className="space-y-3">
              <li className="flex justify-between items-center p-3 bg-secondary/20 rounded-lg">
                      <span className="font-medium">Payment Status</span>
                      <Badge
                        variant={paymentStatus === "paid" ? "default" : "destructive"}
                        className={cn(
                          "px-3 py-1 text-xs font-medium",
                          paymentStatus === "paid" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600",
                        )}
                      >
                        {paymentStatus === "paid" ? "Paid" : "Unpaid"}
                      </Badge>
                    </li>
                <li className="flex justify-between items-center p-3 bg-secondary/20 rounded-lg">
                  <span className="font-medium">Number of Teams</span>
                  <Badge variant="secondary">{maxTeams}</Badge>
                </li>
                <li className="flex justify-between items-center p-3 bg-secondary/20 rounded-lg">
                  <span className="font-medium">Draft Type</span>
                  <Badge variant="secondary">Snake</Badge>
                </li>
                <li className="flex justify-between items-center p-3 bg-secondary/20 rounded-lg">
                  <span className="font-medium">Scoring Type</span>
                  <Badge variant="secondary">Custom</Badge>
                </li>
                <li className="flex justify-between items-center p-3 bg-secondary/20 rounded-lg">
                  <span className="font-medium">Draft Board</span>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/draft/${leagueDetails.id}`} className="flex items-center gap-2">
                      <span>View</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}


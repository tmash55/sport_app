"use client"

import { useState, useEffect, useMemo, AwaitedReactNode, JSXElementConstructor, ReactElement, ReactNode, ReactPortal } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { DraftOrderManager } from "@/components/leagues/DraftOrderManager"
import { useLeague } from "@/app/context/LeagueContext"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Trophy, Users, Settings, Hash, Book, ArrowRight, CalendarDays, Clock, DollarSign, Crown, Sparkles, Calendar, Target, BookOpen, TrendingUp, Star, Layout, Calculator, Shuffle, CreditCard } from "lucide-react"
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

const roundNames = {
  1: "First Round",
  2: "Second Round",
  3: "Sweet 16",
  4: "Elite Eight",
  5: "Final Four",
  6: "Championship",
}


const scoringRounds = [
  { round: "Round 1", points: 1 },
  { round: "Round 2", points: 2 },
  { round: "Sweet 16 (Round 3)", points: 4 },
  { round: "Elite 8 (Round 4)", points: 8 },
  { round: "Final Four (Round 5)", points: 16 },
  { round: "Championship (Round 6)", points: 32 },
]

const importantDates = [
  {
    event: "Selection Sunday",
    date: "March 16, 2024",
  },
  {
    event: "First Four",
    date: "March 18-19, 2024",
  },
  {
    event: "First Round",
    date: "March 21-22, 2024",
  },
  {
    event: "Second Round",
    date: "March 23-24, 2024",
  },
  {
    event: "Sweet 16",
    date: "March 28-29, 2024",
  },
  {
    event: "Elite Eight",
    date: "March 30-31, 2024",
  },
  {
    event: "Final Four",
    date: "April 5, 2024",
  },
  {
    event: "Championship",
    date: "April 7, 2024",
  },
]

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

  return (
    <div className="space-y-6 py-2 sm:py-3 md:py-4">
      

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="overview" className="flex items-center justify-center">
            <Users className="w-4 h-4 mr-2" />
            Overview
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

        <TabsContent value="overview" className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Members List */}
          <Card>
            <CardHeader className="border-b bg-muted/50">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-primary" />
                Pool Members
              </CardTitle>
              <CardDescription>
                Teams participating in this pool ({assignedMembers.length}/{maxTeams})
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <ScrollArea className="h-[600px] pr-4">
                <ul className="space-y-3">
                  {assignedMembers.map((member: { user_id: any; team_name: any; users: { email: any; display_name: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> }; role: string; draft_position: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | Promise<AwaitedReactNode> }, index: number) => (
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

          {/* Important Dates */}
          <Card className="overflow-hidden">
            <CardHeader className="border-b bg-muted/50">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CalendarDays className="h-5 w-5 text-primary" />
                Tournament Schedule
              </CardTitle>
              <CardDescription>Important tournament dates and deadlines</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="space-y-4">
                {importantDates.map((item, index) => (
                  <li
                    key={index}
                    className={cn(
                      "group flex items-start gap-3 p-2 rounded-lg transition-colors hover:bg-muted/50",
                      item.event === "Selection Sunday" && "bg-primary/5",
                    )}
                  >
                    <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div className="flex-grow">
                      <p
                        className={cn(
                          "font-medium",
                          (item.event === "Selection Sunday" || item.event === "Championship") &&
                            "font-bold text-primary",
                        )}
                      >
                        {item.event}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">{item.date}</p>
                        
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
      <TabsContent value="rules">
        <Card>
          <CardHeader className="border-b bg-muted/50">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5 text-primary" />
              League Rules
            </CardTitle>
            <CardDescription>Official rules for the March Madness Draft Pool</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <ScrollArea className="h-[600px] pr-4">
              <div className="grid gap-6">
                {/* Pool Overview */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-lg">Pool Overview</h3>
                  </div>
                  <Card className="bg-muted/50">
                    <CardContent className="p-6 space-y-4">
                      <p className="text-muted-foreground">
                        This pool follows a March Madness Draft format, where users draft college teams instead of
                        filling out a bracket.
                      </p>
                      <div className="flex justify-between items-center p-3 bg-background rounded-lg">
                        <span className="font-medium">Pool Size:</span>
                        <Badge variant="secondary">4-12 members</Badge>
                      </div>
                      <div className="space-y-2">
                        <p className="font-medium flex items-center gap-2">
                          <Target className="h-4 w-4 text-primary" />
                          Draft Format
                        </p>
                        <div className="pl-6 space-y-2">
                          <p>Each pool member will draft an equal number of teams from the tournament field.</p>
                          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                            <li>8 members → Each drafts 8 teams</li>
                            <li>6 members → Each drafts 10 teams</li>
                          </ul>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="font-medium flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          Draft Timing
                        </p>
                        <ul className="pl-6 list-disc space-y-1 text-muted-foreground">
                          <li>The Pool Commissioner sets the draft time.</li>
                          <li>The draft will not start automatically—the Commissioner must manually start it.</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Scoring System */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-lg">Scoring & Points System</h3>
                  </div>
                  <Card className="bg-muted/50">
                    <CardContent className="p-6 space-y-6">
                      <p className="text-muted-foreground">
                        Teams earn points for each win they secure in the tournament. Points increase each round, making
                        deeper runs more valuable.
                      </p>

                      <div className="space-y-3">
                        <p className="font-medium flex items-center gap-2">
                          <Crown className="h-4 w-4 text-primary" />
                          Default Scoring System
                        </p>
                        <div className="grid gap-2">
                          {scoringRounds.map(({ round, points }) => (
                            <div
                              key={round}
                              className="flex items-center justify-between p-3 bg-background rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <span className="font-medium">{round}</span>
                              <Badge variant="secondary">
                                {points} point{points > 1 ? "s" : ""} per win
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <p className="font-medium flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-primary" />
                          Upset Bonus
                        </p>
                        <div className="bg-background rounded-lg p-4 space-y-3">
                          <p className="text-muted-foreground">
                            If a lower-seeded team beats a higher-seeded team, the team earns extra points based on the
                            seed difference.
                          </p>
                          <div className="bg-primary/5 rounded-lg p-3">
                            <p className="text-sm font-medium">Example:</p>
                            <p className="text-sm text-muted-foreground">
                              A #12 seed defeats a #5 seed → earns (12 - 5 = 7 upset points) + round win points
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            The upset multiplier is set to 1 by default, but the Commissioner can adjust scoring rules
                            under the Scoring Settings tab.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* League Completion */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-lg">League Completion & Standings</h3>
                  </div>
                  <Card className="bg-muted/50">
                    <CardContent className="p-6 space-y-3">
                      <p className="text-muted-foreground">
                        The pool concludes after the Championship game, and final standings are updated. Standings
                        reflect total points accumulated throughout the tournament.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Pool Access */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-lg">Pool Creation & Access</h3>
                  </div>
                  <Card className="bg-muted/50">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center gap-2 bg-background rounded-lg p-3">
                        <Badge variant="secondary">Free</Badge>
                        <p className="font-medium">Creating a Pool</p>
                      </div>
                      <p className="text-muted-foreground">
                        Members can create a pool and complete the draft at no cost.
                      </p>
                      <div className="space-y-3">
                        <p className="font-medium">Commissioner Payment Required for:</p>
                        <ul className="grid gap-2">
                          {["League standings", "Scoring updates", "Full pool details"].map((feature) => (
                            <li key={feature} className="flex items-center gap-2 bg-background rounded-lg p-3">
                              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                              <span className="text-muted-foreground">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <p className="text-sm text-muted-foreground bg-primary/5 rounded-lg p-3">
                        The Pool Commissioner must make a payment before or after the draft to unlock these features.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="scoring">
        <Card>
          <CardHeader className="border-b bg-muted/50">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Trophy className="h-5 w-5 text-primary" />
                  Scoring System
                </CardTitle>
                <CardDescription>Points awarded for each round and upset bonuses</CardDescription>
              </div>
              {isCommissioner && (
                <LeagueSettingsDialog leagueId={leagueDetails.id} isCommissioner={isCommissioner} defaultTab="scoring">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Settings className="h-4 w-4" />
                    Edit Scoring
                  </Button>
                </LeagueSettingsDialog>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Round Scores */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-lg">Round Scores</h3>
                </div>
                <Card className="bg-muted/50">
                  <CardContent className="p-6">
                    <div className="grid gap-2">
                      {roundScores.map(({ round, score }) => (
                        <div
                          key={round}
                          className="flex items-center justify-between p-3 bg-background rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                              <span className="text-xs font-medium text-primary">{round}</span>
                            </div>
                            <span className="font-medium">{roundNames[round as keyof typeof roundNames]}</span>
                          </div>
                          <Badge variant="secondary" className="ml-auto">
                            {score} points
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Upset Bonus */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-lg">Upset Bonus</h3>
                </div>
                <Card className="bg-muted/50">
                  <CardContent className="p-6 space-y-4">
                    <p className="text-muted-foreground">
                      When a lower-seeded team defeats a higher-seeded team, additional points are awarded based on the
                      seed difference.
                    </p>
                    <div className="bg-background rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          <span className="font-medium">Upset Multiplier</span>
                        </div>
                        <Badge variant="secondary">{leagueSettings.upset_multiplier}x</Badge>
                      </div>
                      <div className="bg-primary/5 rounded-lg p-3 space-y-2">
                        <p className="text-sm font-medium">Example Calculation:</p>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>If a #12 seed defeats a #5 seed:</p>
                          <ul className="list-disc pl-4 space-y-1">
                            <li>Seed Difference: 12 - 5 = 7</li>
                            <li>
                              Upset Points: 7 × {leagueSettings.upset_multiplier} ={" "}
                              {7 * leagueSettings.upset_multiplier} points
                            </li>
                            <li>Total: Round points + Upset points</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="settings">
        <Card>
          <CardHeader className="border-b bg-muted/50">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Settings className="h-5 w-5 text-primary" />
                  League Settings
                </CardTitle>
                <CardDescription>General settings for this league</CardDescription>
              </div>
              {isCommissioner && (
                <LeagueSettingsDialog leagueId={leagueDetails.id} isCommissioner={isCommissioner} defaultTab="general">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Settings className="h-4 w-4" />
                    Edit Settings
                  </Button>
                </LeagueSettingsDialog>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Payment Status */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full",
                      paymentStatus === "paid" ? "bg-green-100" : "bg-red-100",
                    )}
                  >
                    <CreditCard
                      className={cn("h-4 w-4", paymentStatus === "paid" ? "text-green-600" : "text-red-600")}
                    />
                  </div>
                  <span className="font-medium">Payment Status</span>
                </div>
                <Badge
                  variant={paymentStatus === "paid" ? "default" : "destructive"}
                  className={cn(
                    "px-3 py-1 text-xs font-medium",
                    paymentStatus === "paid" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600",
                  )}
                >
                  {paymentStatus === "paid" ? "Paid" : "Unpaid"}
                </Badge>
              </div>

              {/* Number of Teams */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium">Number of Teams</span>
                </div>
                <Badge variant="secondary">{maxTeams}</Badge>
              </div>

              {/* Draft Type */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <Shuffle className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium">Draft Type</span>
                </div>
                <Badge variant="secondary">Snake</Badge>
              </div>

              {/* Scoring Type */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <Calculator className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium">Scoring Type</span>
                </div>
                <Badge variant="secondary">Custom</Badge>
              </div>

              {/* Draft Board */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <Layout className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium">Draft Board</span>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/draft/${leagueDetails.id}`} className="flex items-center gap-2">
                    <span>View</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      </Tabs>
    </div>
  )
}


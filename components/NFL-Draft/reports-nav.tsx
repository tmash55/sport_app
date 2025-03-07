"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DraftPercentageTable } from "./draft-percentage-table"
import { format } from "date-fns"

type ReportType = "draft-percentage" | "other-report"

export interface PlayerDraftStats {
  player_id: string
  name: string
  position: string
  positions: string[]
  team: string
  price: number
  draft_count: number
  draft_percentage: number
  total_entries: number
}

interface ReportsNavProps {
  playerDraftStats: PlayerDraftStats[]
}

export function ReportsNav({ playerDraftStats }: ReportsNavProps) {
  const [activeReport, setActiveReport] = useState<ReportType>("draft-percentage")

  // Get total number of unique players drafted
  const uniquePlayerCount = playerDraftStats.filter((p) => p.draft_count > 0).length
  const currentTime = new Date()

  return (
    <Tabs
      defaultValue="draft-percentage"
      className="w-full"
      onValueChange={(value) => setActiveReport(value as ReportType)}
    >
      <TabsList className="grid w-full grid-cols-2 mb-8">
        <TabsTrigger value="draft-percentage">Pool Draft Percentage</TabsTrigger>
        <TabsTrigger value="other-report" disabled>
          Other Reports
        </TabsTrigger>
      </TabsList>

      <TabsContent value="draft-percentage">
        <Card>
          <CardHeader>
            <CardTitle>Player Draft Percentage</CardTitle>
            <CardDescription>
              See how frequently each player was drafted across all entries in your league.
              {playerDraftStats.length > 0 && (
                <div className="mt-2 text-sm">
                  <span className="font-medium">{uniquePlayerCount}</span> unique players drafted across{" "}
                  <span className="font-medium">{playerDraftStats[0].total_entries}</span> entries.
                  <div className="text-xs text-muted-foreground mt-1">
                    Data as of {format(currentTime, "MMMM d, yyyy h:mm a")}
                  </div>
                </div>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DraftPercentageTable players={playerDraftStats} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="other-report">
        <Card>
          <CardHeader>
            <CardTitle>Other Report</CardTitle>
            <CardDescription>Future report placeholder.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This report is coming soon.</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}


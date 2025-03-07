"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { LockIcon, CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { useEffect, useState } from "react"
import { useNflDraft } from "@/app/context/NflDraftContext"
import { ReportsNav } from "@/components/NFL-Draft/reports-nav"

interface Player {
  id: string
  first_name: string
  last_name: string
  positions: string[]
  school: string
  price: number
}

interface RosterPlayer {
  id: string
  [key: string]: any
}

interface Roster {
  [position: string]: RosterPlayer
}

interface Entry {
  id: string
  roster: Roster
  [key: string]: any
}

interface PlayerDraftStats {
  player_id: string
  name: string
  position: string
  team: string
  price: number
  draft_count: number
  draft_percentage: number
  total_entries: number
  positions: string[]
}

export default function ReportsPage() {
  const { league, entries, players, loading, playersLoading } = useNflDraft()
  const [isDeadlinePassed, setIsDeadlinePassed] = useState(false)
  const [pickDeadline, setPickDeadline] = useState<Date | null>(null)

  useEffect(() => {
    if (league) {
      // Parse settings if it's a string
      let settings: any = league.settings

      if (typeof settings === "string") {
        try {
          settings = JSON.parse(settings)
        } catch (error) {
          console.error("Error parsing league settings:", error)
          settings = {}
        }
      }

      // Get lock_date from settings
      const lockDateStr = settings?.lock_entries_at
      console.log("Lock date from settings:", lockDateStr)

      if (lockDateStr) {
        const lockDate = new Date(lockDateStr)
        setPickDeadline(lockDate)

        // Check if current time is past the deadline
        const now = new Date()
        const deadlinePassed = now > lockDate
        console.log("Current time:", now.toISOString())
        console.log("Lock date:", lockDate.toISOString())
        console.log("Deadline passed:", deadlinePassed)

        setIsDeadlinePassed(deadlinePassed)
      } else {
        // If no lock date is set, default to showing the reports
        console.log("No lock date found in settings")
        setIsDeadlinePassed(true)
      }
    }
  }, [league])

  if (loading || playersLoading) {
    return <ReportsSkeleton />
  }

  // Calculate player draft percentages
  const playerDraftStats = calculatePlayerDraftPercentages(players, entries)

  return (
    <div className="container py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          View detailed reports and statistics for {league?.name || "your league"}.
        </p>
      </div>

      {!isDeadlinePassed ? (
        <LockedReportMessage lockDate={pickDeadline} />
      ) : (
        <ReportsNav playerDraftStats={playerDraftStats} />
      )}
    </div>
  )
}

function LockedReportMessage({ lockDate }: { lockDate: Date | null }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <LockIcon className="h-5 w-5 text-amber-500" />
          <CardTitle>Reports Locked</CardTitle>
        </div>
        <CardDescription>Draft percentage reports are not available until after the entry deadline.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-muted p-6 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-amber-100 p-3 text-amber-600 dark:bg-amber-900 dark:text-amber-300">
              <CalendarIcon className="h-6 w-6" />
            </div>
          </div>
          <h3 className="mb-1 text-lg font-medium">Entry Deadline</h3>
          {lockDate ? (
            <p className="text-sm text-muted-foreground">
              Reports will be available after{" "}
              <span className="font-medium text-foreground">{format(lockDate, "MMMM d, yyyy h:mm a")}</span>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">Reports will be available after the entry deadline.</p>
          )}
          <p className="mt-4 text-sm">
            This ensures all participants have an equal opportunity to make their selections without being influenced by
            other entries.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function calculatePlayerDraftPercentages(players: Player[], entries: Entry[]): PlayerDraftStats[] {
  const totalEntries = entries.length

  // Create a map to count how many times each player was drafted
  const draftCounts: Record<string, number> = {}

  // Count occurrences of each player in entries
  entries.forEach((entry) => {
    if (entry.roster) {
      Object.values(entry.roster).forEach((player: RosterPlayer) => {
        if (player && player.id) {
          draftCounts[player.id] = (draftCounts[player.id] || 0) + 1
        }
      })
    }
  })

  // Create the player stats array
  const playerStats: PlayerDraftStats[] = players.map((player) => {
    const draftCount = draftCounts[player.id] || 0
    const draftPercentage = totalEntries > 0 ? (draftCount / totalEntries) * 100 : 0

    return {
      player_id: player.id,
      name: `${player.first_name} ${player.last_name}`,
      positions: player.positions, // Keep all positions
      position: player.positions.join("/"), // Join positions with a slash for display
      team: player.school,
      price: player.price || 0,
      draft_count: draftCount,
      draft_percentage: draftPercentage,
      total_entries: totalEntries,
    }
  })

  // Sort by draft percentage (descending)
  return playerStats.sort((a, b) => b.draft_percentage - a.draft_percentage)
}

function ReportsSkeleton() {
  return (
    <div className="container py-10 space-y-8">
      <div>
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-2/3 mt-2" />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-10 w-32" />
            </div>
            <Skeleton className="h-[400px] w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


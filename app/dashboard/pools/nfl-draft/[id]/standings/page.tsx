"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Leaderboard } from "@/components/NFL-Draft/Leaderboard"
import { useNflDraft } from "@/app/context/NflDraftContext"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useUser } from "@/app/context/UserProvider"

export default function StandingsPage() {
  const { league, entries, loading } = useNflDraft()
  const { user } = useUser()
  const [searchTerm, setSearchTerm] = useState("")

  if (loading) {
    return <StandingsPageSkeleton />
  }

  if (!league) {
    return <div>League not found</div>
  }

  const settings = league.settings ? JSON.parse(league.settings) : {}
  const pickDeadline = settings.lock_entries_at ? new Date(settings.lock_entries_at) : null

  const filteredEntries = entries.filter((entry) => entry.entry_name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="container max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold tracking-tight mb-4">Standings</h1>

      <div className="mb-6">
        <p className="text-muted-foreground">
          Pick deadline: {pickDeadline ? format(pickDeadline, "MMMM d, yyyy 'at' h:mm a 'ET'") : "Not set"}
        </p>
        <div className="mt-4 p-4 bg-muted/30 rounded-lg border border-border/30">
          <h3 className="font-medium mb-2">How to use this leaderboard:</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Click on any row to expand and view the complete roster for that entry</li>
            <li>• Your entries are highlighted in the table</li>
            <li>• Sort by clicking on column headers</li>
            <li>• Use the search bar to find specific entries</li>
            <li>• Trophy icons indicate the top 3 entries</li>
          </ul>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Leaderboard entries={filteredEntries} pickDeadline={pickDeadline} />

      <div className="mt-8 text-sm text-muted-foreground">
        <p>* Standings are updated in real-time as the NFL Draft progresses</p>
        <p>* Full roster details are visible after the pick deadline</p>
      </div>
    </div>
  )
}

function StandingsPageSkeleton() {
  return (
    <div className="container max-w-7xl mx-auto px-4 py-6">
      <Skeleton className="h-10 w-48 mb-4" />
      <Skeleton className="h-6 w-96 mb-6" />
      <Skeleton className="h-10 w-full mb-6" />
      <Skeleton className="h-96 w-full" />
    </div>
  )
}


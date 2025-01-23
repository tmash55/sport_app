"use client"

import { useState } from "react"
import { LeagueCards } from "./LeagueCards"
import { Button } from "@/components/ui/button"

interface Contest {
  id: string
  name: string
  contest_type: string
  sport: string
}

interface LeagueMember {
  user_id: string | null
  role: string
}

interface League {
  id: string
  name: string
  commissioner_id: string
  contests: Contest
  league_members: LeagueMember[]
  all_members: LeagueMember[]
  draft_start_time?: string
  draft_status: "completed" | "scheduled" | "not_scheduled"
}

interface LeagueGridProps {
  leagues: League[]
  userId: string
}

export function LeagueGrid({ leagues, userId }: LeagueGridProps) {
  const [page, setPage] = useState(1)
  const itemsPerPage = 6

  if (!leagues.length) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No pools or contests found.</p>
      </div>
    )
  }

  const paginatedLeagues = leagues.slice(0, page * itemsPerPage)
  const hasMore = paginatedLeagues.length < leagues.length

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {paginatedLeagues.map((league) => {
          console.log("League:", league.name)
          console.log("All league members:", league.all_members)
          const assignedMembers = league.all_members.filter((member) => member.user_id !== null)
          console.log("Assigned members:", assignedMembers)
          console.log("Assigned member count:", assignedMembers.length)
          console.log("Total member slots:", league.all_members.length)

          return (
            <LeagueCards
              key={league.id}
              league={{
                ...league,
                memberCount: assignedMembers.length,
                totalSlots: league.all_members.length,
                contest: league.contests,
                draft_status: league.draft_status || "not_scheduled",
                draft_start_time: league.draft_start_time,
              }}
              isCommissioner={league.commissioner_id === userId}
            />
          )
        })}
      </div>
      {hasMore && (
        <div className="flex justify-center mt-6">
          <Button variant="outline" onClick={() => setPage((prevPage) => prevPage + 1)}>
            Load More
          </Button>
        </div>
      )}
    </div>
  )
}


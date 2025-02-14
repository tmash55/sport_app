"use client"

import { useState, useMemo } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"
import { Trophy } from "lucide-react"
import type { DraftPick, LeagueMember } from "@/types/draft"

interface RosterProps {
  draftPicks: DraftPick[]
  currentLeagueMemberId: string
  maxTeams: number
  leagueMembers: LeagueMember[]
}

export function Roster({ draftPicks, currentLeagueMemberId, maxTeams, leagueMembers }: RosterProps) {
  const [selectedUser, setSelectedUser] = useState(currentLeagueMemberId)

  const userRoster = useMemo(() => {
    if (!selectedUser) return []

    const uniquePicks = new Map() // 🔥 Prevent duplicates
    draftPicks.forEach((pick) => {
      if (pick.league_member_id === selectedUser && !uniquePicks.has(pick.id)) {
        uniquePicks.set(pick.id, pick)
      }
    })

    return Array.from(uniquePicks.values()).sort((a, b) => a.pick_number - b.pick_number)
  }, [draftPicks, selectedUser])

  const totalPicks = Math.floor(64 / maxTeams)
  const remainingPicks = totalPicks - userRoster.length

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 mb-2 sm:mb-4 p-0.5">
        <h2 className="text-base sm:text-lg font-semibold">Roster</h2>
        <Select value={selectedUser} onValueChange={(value) => setSelectedUser(value)}>
          <SelectTrigger className="w-full sm:w-[180px] h-8 sm:h-9 text-xs sm:text-sm relative">
            <SelectValue placeholder="Select a user" />
          </SelectTrigger>
          <SelectContent>
            {leagueMembers.map((member) => (
              <SelectItem key={member.id} value={member.id} className="text-xs sm:text-sm">
                {member.team_name || member.users.display_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <ScrollArea className="flex-grow -mx-2 px-2">
        <div className="space-y-1.5 sm:space-y-2">
          {userRoster.map((pick) => (
            <div
              key={pick.id}
              className="flex items-center gap-2 p-1.5 sm:p-2 bg-secondary rounded-md hover:bg-secondary/80 transition-colors"
            >
              <div className="relative flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8">
                {pick?.league_teams?.global_teams?.logo_filename ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={`/images/team-logos/${pick.league_teams.global_teams.logo_filename}`}
                      alt={`${pick.league_teams.name} logo`}
                      fill
                      className="object-contain p-0.5"
                      sizes="(max-width: 640px) 24px, 32px"
                      priority={userRoster.indexOf(pick) < 3}
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10 rounded-full">
                    <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                  </div>
                )}
              </div>
              <div className="flex-grow min-w-0">
                <p className="text-xs sm:text-sm font-medium truncate">
                  ({pick?.league_teams?.seed}) {pick?.league_teams?.name}
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  Round {Math.floor((pick.pick_number - 1) / maxTeams) + 1}, Pick{" "}
                  {((pick.pick_number - 1) % maxTeams) + 1}
                </p>
              </div>
            </div>
          ))}
          {remainingPicks > 0 ? (
            <p className="text-xs sm:text-sm text-muted-foreground mt-2 px-1.5 sm:px-2">
              Remaining picks: {remainingPicks}
            </p>
          ) : (
            <p className="text-xs sm:text-sm text-green-500 mt-2 px-1.5 sm:px-2">All picks completed</p>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}


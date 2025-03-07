"use client"

import { useState, useMemo } from "react"
import { ChevronDown, ChevronUp, Trophy, Medal, LockIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useUser } from "@/app/context/UserProvider"
import { useNflDraft } from "@/app/context/NflDraftContext"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import React from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Player {
  id: string
  first_name: string
  last_name: string
  positions: string[]
  price: number
  school: string
  is_drafted?: boolean
  draft_position?: number
  name: string
}

interface Entry {
  id: string
  entry_name: string
  league_member_id: string
  roster: string | Record<string, Player> // Can be a string (JSONB) or already parsed object
  points: number
  drafted_count: number
}

interface LeaderboardProps {
  entries: Entry[]
  pickDeadline: Date | null
}

export function Leaderboard({ entries, pickDeadline }: LeaderboardProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [sortConfig, setSortConfig] = useState<{ key: keyof Entry; direction: "ascending" | "descending" }>({
    key: "points",
    direction: "descending",
  })

  const { user } = useUser()
  const { league } = useNflDraft()
  const isDeadlinePassed = pickDeadline ? new Date() > pickDeadline : false
  const userLeagueMember = league?.league_members.find((member: any) => member.user_id === user?.id)

  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === "ascending" ? -1 : 1
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === "ascending" ? 1 : -1
      return 0
    })
  }, [entries, sortConfig])

  const toggleSort = (key: keyof Entry) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === "ascending" ? "descending" : "ascending",
    }))
  }

  const toggleExpand = (id: string, isCurrentUser: boolean) => {
    console.log("Toggling expand for entry:", id)

    // Only allow expansion of current user's entries before deadline
    if (!isDeadlinePassed && !isCurrentUser) {
      console.log("Access denied: Can't view other entries before deadline")
      return
    }

    setExpandedRows((current) => {
      const newSet = new Set(current)
      if (newSet.has(id)) {
        console.log("Closing row:", id)
        newSet.delete(id)
      } else {
        console.log("Expanding row:", id)
        newSet.add(id)
      }

      console.log("Updated expandedRows:", Array.from(newSet))
      return newSet
    })
  }

  const formatPlayerName = (player: Player) => {
    return player.name || `${player.first_name[0]}. ${player.last_name}`
  }

  // Helper function to parse roster data if needed
  const getRosterData = (entry: Entry): Record<string, Player> => {
    if (typeof entry.roster === "string") {
      try {
        return JSON.parse(entry.roster)
      } catch (error) {
        console.error("Error parsing roster data:", error)
        return {}
      }
    }
    return entry.roster as Record<string, Player>
  }

  return (
    <Card className="overflow-hidden border-none shadow-md">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-border/50">
              <TableHead className="w-[100px]">Rank</TableHead>
              <TableHead
                className="cursor-pointer transition-colors hover:text-primary"
                onClick={() => toggleSort("entry_name")}
              >
                <div className="flex items-center gap-2">
                  Entry Name
                  {sortConfig.key === "entry_name" && (
                    <span className="text-primary">
                      {sortConfig.direction === "ascending" ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </span>
                  )}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer text-right transition-colors hover:text-primary"
                onClick={() => toggleSort("points")}
              >
                <div className="flex items-center justify-end gap-2">
                  Points
                  {sortConfig.key === "points" && (
                    <span className="text-primary">
                      {sortConfig.direction === "ascending" ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </span>
                  )}
                </div>
              </TableHead>
              <TableHead className="text-right">Drafted</TableHead>
              <TableHead className="w-[100px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedEntries.map((entry, index) => {
              const isCurrentUser = entry.league_member_id === userLeagueMember?.id
              const rosterData = getRosterData(entry)
              const canViewDetails = isDeadlinePassed || isCurrentUser

              return (
                <React.Fragment key={entry.id}>
                  <TableRow
                    className={cn(
                      "transition-colors",
                      canViewDetails && "cursor-pointer",
                      expandedRows.has(entry.id) && "border-l-4 border-l-primary",
                      isCurrentUser && "bg-primary/5 hover:bg-primary/10",
                      !isCurrentUser && "hover:bg-muted/50",
                    )}
                    onClick={() => toggleExpand(entry.id, isCurrentUser)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {index === 0 ? (
                          <Trophy className="h-5 w-5 text-yellow-500" />
                        ) : index === 1 ? (
                          <Medal className="h-5 w-5 text-gray-400" />
                        ) : index === 2 ? (
                          <Medal className="h-5 w-5 text-amber-600" />
                        ) : (
                          <span className="font-medium ml-2">{index + 1}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className={cn("font-medium", isCurrentUser && "text-primary")}>
                      {entry.entry_name}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">You</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">{entry.points}</TableCell>
                    <TableCell className="text-right">
                      <span
                        className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          entry.drafted_count === 8 ? "bg-green-500/10 text-green-600" : "bg-muted",
                        )}
                      >
                        {entry.drafted_count}/8
                      </span>
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleExpand(entry.id, isCurrentUser)
                              }}
                              className="w-full justify-between"
                              disabled={!canViewDetails}
                            >
                              {!canViewDetails ? (
                                <LockIcon className="h-4 w-4 text-muted-foreground" />
                              ) : expandedRows.has(entry.id) ? (
                                "Hide"
                              ) : (
                                "Show"
                              )}
                              {canViewDetails && (
                                <ChevronDown
                                  className={cn(
                                    "h-4 w-4 ml-1 transition-transform",
                                    expandedRows.has(entry.id) && "rotate-180",
                                  )}
                                />
                              )}
                            </Button>
                          </TooltipTrigger>
                          {!canViewDetails && (
                            <TooltipContent>
                              <p>Entry details will be available after the pick deadline</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                  {expandedRows.has(entry.id) && canViewDetails && (
                    <TableRow>
                      <TableCell colSpan={5} className="bg-muted/30 p-0">
                        <div className="p-4 space-y-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Object.entries(rosterData).map(([slotId, player]) => (
                              <div
                                key={slotId}
                                className={cn(
                                  "p-3 rounded-lg text-sm",
                                  player.is_drafted ? "bg-green-500/10" : "bg-muted/50",
                                )}
                              >
                                <div className="font-medium mb-1">{slotId.split("-")[0]}</div>
                                <div>{formatPlayerName(player)}</div>
                                <div className="text-muted-foreground text-xs mt-1">
                                  {player.school}
                                  {player.is_drafted && player.draft_position && (
                                    <span className="text-green-600 ml-2">Pick #{player.draft_position}</span>
                                  )}
                                </div>
                                <div className="text-muted-foreground text-xs mt-1">
                                  ${player.price.toLocaleString()}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}


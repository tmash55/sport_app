"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ChevronDown, Search, DollarSign, ArrowUpDown } from "lucide-react"

import type { PlayerDraftStats } from "./reports-nav"
import { cn } from "@/lib/utils"
import { Position } from "@/app/context/NflDraftContext"

type FilterPosition = "ALL" | Position
type SortOption = "draft_percentage" | "price" | "name"

// Position color mapping with both text and background colors
const positionColors: Record<string, { text: string; bg: string }> = {
  QB: {
    text: "text-red-600 dark:text-red-400",
    bg: "bg-red-600 dark:bg-red-400",
  },
  RB: {
    text: "text-green-600 dark:text-green-400",
    bg: "bg-green-600 dark:bg-green-400",
  },
  WR: {
    text: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-600 dark:bg-blue-400",
  },
  TE: {
    text: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-600 dark:bg-purple-400",
  },
  OT: {
    text: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-600 dark:bg-orange-400",
  },
  OG: {
    text: "text-yellow-600 dark:text-yellow-400",
    bg: "bg-yellow-600 dark:bg-yellow-400",
  },
  C: {
    text: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-600 dark:bg-amber-400",
  },
  OL: {
    text: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-600 dark:bg-orange-400",
  },
  EDGE: {
    text: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-600 dark:bg-rose-400",
  },
  DT: {
    text: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-600 dark:bg-indigo-400",
  },
  LB: {
    text: "text-cyan-600 dark:text-cyan-400",
    bg: "bg-cyan-600 dark:bg-cyan-400",
  },
  CB: {
    text: "text-teal-600 dark:text-teal-400",
    bg: "bg-teal-600 dark:bg-teal-400",
  },
  S: {
    text: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-600 dark:bg-sky-400",
  },
  
}

// Function to get position color based on position string (handles multi-position)
function getPositionColor(position: string, type: "text" | "bg"): string {
  // If it's a single position, return its color directly
  if (positionColors[position]) {
    return positionColors[position][type]
  }

  // For multi-positions, use the color of the first position
  const firstPosition = position.split("/")[0]
  return positionColors[firstPosition] ? positionColors[firstPosition][type] : ""
}

export function DraftPercentageTable({ players }: { players: PlayerDraftStats[] }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [positionFilter, setPositionFilter] = useState<FilterPosition>("ALL")
  const [sortBy, setSortBy] = useState<SortOption>("draft_percentage")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  // Filter players based on search query and position
  const filteredPlayers = players
    .filter((player) => {
      const matchesSearch =
        player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.team.toLowerCase().includes(searchQuery.toLowerCase())

      // Check if any of the player's positions match the filter
      const matchesPosition = positionFilter === "ALL" || player.positions.includes(positionFilter)

      return matchesSearch && matchesPosition
    })
    .sort((a, b) => {
      if (sortBy === "draft_percentage") {
        return sortDirection === "desc"
          ? b.draft_percentage - a.draft_percentage
          : a.draft_percentage - b.draft_percentage
      } else if (sortBy === "price") {
        return sortDirection === "desc" ? b.price - a.price : a.price - b.price
      } else {
        return sortDirection === "desc" ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name)
      }
    })

  const toggleSort = (option: SortOption) => {
    if (sortBy === option) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortBy(option)
      setSortDirection("desc")
    }
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search players or teams..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Sort: {sortBy === "draft_percentage" ? "Draft %" : sortBy === "price" ? "Price" : "Name"}
                  <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => toggleSort("draft_percentage")}>Draft %</DropdownMenuItem>
                <DropdownMenuItem onClick={() => toggleSort("price")}>Price</DropdownMenuItem>
                <DropdownMenuItem onClick={() => toggleSort("name")}>Name</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Position: {positionFilter} <ChevronDown className="ml-2 h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setPositionFilter("ALL")}>ALL</DropdownMenuItem>
                {Object.keys(positionColors).map((position) => (
                  <DropdownMenuItem
                    key={position}
                    onClick={() => setPositionFilter(position as Position)}
                    className={positionColors[position].text}
                  >
                    {position}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Player</TableHead>
                <TableHead className="w-[60%]">Draft %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlayers.length > 0 ? (
                filteredPlayers.map((player) => (
                  <TableRow key={player.player_id}>
                    <TableCell className="py-3">
                      <div className="text-base font-semibold">{player.name}</div>
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                        <span className={cn("font-medium", getPositionColor(player.position, "text"))}>
                          {player.position}
                        </span>
                        <span>•</span>
                        <span>{player.team}</span>
                        {player.price > 0 && (
                          <>
                            <span>•</span>
                            <span className="flex items-center font-medium text-green-600 dark:text-green-400">
                              <DollarSign className="h-3 w-3 mr-0.5" />
                              {player.price}
                            </span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-3">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="relative w-full max-w-64 cursor-help">
                              <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                <div
                                  className={cn("h-3 rounded-full opacity-80", getPositionColor(player.position, "bg"))}
                                  style={{ width: `${Math.min(100, player.draft_percentage)}%` }}
                                />
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="font-medium">
                            Drafted in {player.draft_count} of {player.total_entries} entries
                          </TooltipContent>
                        </Tooltip>
                        <span className="min-w-[3.5rem] text-sm font-medium">
                          {player.draft_percentage.toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="h-24 text-center">
                    No players found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </TooltipProvider>
  )
}


"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search } from "lucide-react"
import type { Position } from "@/app/context/NflDraftContext"

interface Player {
  id: string
  first_name: string
  last_name: string
  positions: Position[]
  price: number
  school: string
}

interface MobilePlayerSelectProps {
  isOpen: boolean
  onClose: () => void
  position: Position | null
  players: Player[]
  onSelectPlayer: (player: Player) => void
  remainingBudget: number
}

export function MobilePlayerSelect({
  isOpen,
  onClose,
  position,
  players,
  onSelectPlayer,
  remainingBudget,
}: MobilePlayerSelectProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredPlayers = players
    .filter((player) => {
      const matchesSearch =
        searchQuery === "" ||
        `${player.first_name} ${player.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.school.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesPosition = player.positions.includes(position as Position)
      const isAffordable = player.price <= remainingBudget
      return matchesSearch && matchesPosition && isAffordable
    })
    .sort((a, b) => b.price - a.price)

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle>Select {position}</SheetTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-140px)]">
          <div className="divide-y">
            {filteredPlayers.map((player) => (
              <Button
                key={player.id}
                variant="ghost"
                className="w-full justify-between h-auto py-4 px-4 rounded-none"
                onClick={() => {
                  onSelectPlayer(player)
                  onClose()
                }}
              >
                <div>
                  <div className="font-medium text-left">{`${player.first_name} ${player.last_name}`}</div>
                  <div className="text-sm text-left text-muted-foreground">{player.school}</div>
                </div>
                <div className="font-medium">${player.price.toLocaleString()}</div>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}


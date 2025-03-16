"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Position } from "@/app/context/NflDraftContext"
import { cn } from "@/lib/utils"

interface Player {
  id: string
  first_name: string
  last_name: string
  positions: Position[]
  price: number
  school: string
}

interface MobileRosterViewProps {
  selectedPlayers: Record<string, Player>
  onSelectPosition: (position: Position, slotId: string) => void
  onRemovePlayer: (player: Player, slotId: string) => void
  remainingBudget: number
  leagueFormat: "offense" | "defense" | "both"
}

const ROSTER_SLOTS = {
  offense: [
    { position: "QB" as Position, label: "Quarterback" },
    { position: "RB" as Position, label: "Running Back", count: 2 },
    { position: "WR" as Position, label: "Wide Receiver", count: 2 },
    { position: "TE" as Position, label: "Tight End" },
    { position: "OL" as Position, label: "Offensive Line", count: 2 },
  ],
  defense: [
    { position: "EDGE" as Position, label: "Edge Rusher", count: 2 },
    { position: "DT" as Position, label: "Defensive Tackle", count: 2 },
    { position: "LB" as Position, label: "Linebacker", count: 3 },
    { position: "CB" as Position, label: "Cornerback", count: 2 },
    { position: "S" as Position, label: "Safety", count: 2 },
  ],
}

export function MobileRosterView({
  selectedPlayers,
  onSelectPosition,
  onRemovePlayer,
  remainingBudget,
  leagueFormat,
}: MobileRosterViewProps) {
  const [selectedSlot, setSelectedSlot] = useState<{
    position: Position
    slotId: string
  } | null>(null)

  const rosterSlots =
    leagueFormat === "both" ? [...ROSTER_SLOTS.offense, ...ROSTER_SLOTS.defense] : ROSTER_SLOTS[leagueFormat]

  const totalRosterSpots = rosterSlots.reduce((total, slot) => total + (slot.count || 1), 0)
  const filledRosterSpots = Object.keys(selectedPlayers).length
  const remainingRosterSpots = totalRosterSpots - filledRosterSpots
  const averagePricePerRemainingSpot = remainingRosterSpots > 0 ? remainingBudget / remainingRosterSpots : 0

  const handleSlotClick = (position: Position, slotId: string) => {
    setSelectedSlot({ position, slotId })
    onSelectPosition(position, slotId)
  }

  return (
    <>
      <ScrollArea className="h-[calc(100vh-120px)]">
        <div className="space-y-2 p-4">
          {rosterSlots.flatMap((slot, slotIndex) =>
            Array.from({ length: slot.count || 1 }).map((_, countIndex) => {
              const slotId = `${slot.position}-${slotIndex}-${countIndex}`
              const player = selectedPlayers[slotId]

              return (
                <Button
                  key={slotId}
                  variant="outline"
                  className={cn("w-full justify-between h-auto py-4 px-4", player && "border-primary")}
                  onClick={() => handleSlotClick(slot.position, slotId)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 text-left font-mono text-sm">{slot.position}</div>
                    <div className="text-left">
                      {player ? (
                        <div>
                          <div className="font-medium">{`${player.first_name} ${player.last_name}`}</div>
                          <div className="text-sm text-muted-foreground">
                            {player.school} • ${player.price.toLocaleString()}
                          </div>
                        </div>
                      ) : (
                        <div className="text-muted-foreground">{slot.label}</div>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Button>
              )
            }),
          )}
        </div>
      </ScrollArea>

      <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span>Positions Filled</span>
          <span className="font-medium">
            {filledRosterSpots}/{totalRosterSpots}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Remaining Salary</span>
          <span className="font-medium">${remainingBudget.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Avg Remaining/Player</span>
          <span className="font-medium">
            $
            {averagePricePerRemainingSpot.toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}
          </span>
        </div>
      </div>
    </>
  )
}


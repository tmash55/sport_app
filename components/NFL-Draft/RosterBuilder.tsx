"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Position } from "@/app/context/NflDraftContext";

interface Player {
  id: string;
  first_name: string;
  last_name: string;
  positions: Position[];
  price: number;
  school: string;
}

interface RosterBuilderProps {
  selectedPlayers: Record<string, Player>;
  onSelectPosition: (position: Position, slotId: string) => void;
  onRemovePlayer: (player: Player, slotId: string) => void;
  remainingBudget: number;
  leagueFormat: "offense" | "defense" | "both";
}

const ROSTER_SLOTS = {
  offense: [
    { position: "QB" as Position, label: "Quarterback", count: 1 },
    { position: "RB" as Position, label: "Running Back", count: 2 },
    { position: "WR" as Position, label: "Wide Receiver", count: 2 },
    { position: "TE" as Position, label: "Tight End", count: 1 },
    { position: "OL" as Position, label: "Offensive Line", count: 2 },
  ],
  defense: [
    { position: "EDGE" as Position, label: "Edge Rusher", count: 2 },
    { position: "DT" as Position, label: "Defensive Tackle", count: 2 },
    { position: "LB" as Position, label: "Linebacker", count: 3 },
    { position: "CB" as Position, label: "Cornerback", count: 2 },
    { position: "S" as Position, label: "Safety", count: 2 },
  ],
};

export function RosterBuilder({
  selectedPlayers,
  onSelectPosition,
  onRemovePlayer,
  remainingBudget,
  leagueFormat,
}: RosterBuilderProps) {
  const rosterSlots =
    leagueFormat === "both"
      ? [...ROSTER_SLOTS.offense, ...ROSTER_SLOTS.defense]
      : ROSTER_SLOTS[leagueFormat];

  const totalRosterSpots = rosterSlots.reduce(
    (total, slot) => total + slot.count,
    0
  );
  const filledRosterSpots = Object.keys(selectedPlayers).length;
  const remainingRosterSpots = totalRosterSpots - filledRosterSpots;
  const averagePricePerRemainingSpot =
    remainingRosterSpots > 0 ? remainingBudget / remainingRosterSpots : 0;

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4 space-y-4">
        <h2 className="text-xl font-semibold">Your Roster</h2>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[15px] text-muted-foreground">
              Remaining Budget
            </span>
            <span className="text-[15px] font-semibold">
              ${remainingBudget.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[15px] text-muted-foreground">
              Roster Spots
            </span>
            <span className="text-[15px] font-semibold">
              {filledRosterSpots}/{totalRosterSpots}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[15px] text-muted-foreground">
              Avg. Price / Remaining Spot
            </span>
            <span className="text-[15px] font-semibold">
              $
              {averagePricePerRemainingSpot.toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}
            </span>
          </div>
          {remainingBudget <= 50000 && (
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-[15px] text-green-600 font-medium">
                In Budget
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {rosterSlots.flatMap((slot, slotIndex) =>
          Array.from({ length: slot.count }).map((_, countIndex) => {
            const slotId = `${slot.position}-${slotIndex}-${countIndex}`;
            const player = selectedPlayers[slotId];

            return (
              <div
                key={slotId}
                className={cn(
                  "relative p-3 rounded-lg transition-all",
                  player
                    ? "bg-muted border"
                    : "border hover:border-primary/50 cursor-pointer"
                )}
                onClick={() =>
                  !player && onSelectPosition(slot.position, slotId)
                }
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className="w-[52px] justify-center py-0.5 text-xs font-semibold"
                    >
                      {slot.position}
                    </Badge>
                    <div>
                      {player ? (
                        <div>
                          <div className="font-medium text-[15px]">{`${player.first_name} ${player.last_name}`}</div>
                          <div className="text-sm text-muted-foreground">
                            {player.school} - ${player.price.toLocaleString()}
                          </div>
                        </div>
                      ) : (
                        <div className="text-[15px] text-muted-foreground">
                          {slot.label}
                        </div>
                      )}
                    </div>
                  </div>
                  {player && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full hover:bg-muted"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemovePlayer(player, slotId);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

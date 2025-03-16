"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import type { Position } from "@/app/context/NflDraftContext";
import { Info } from "lucide-react";

interface Player {
  id: string;
  first_name: string;
  last_name: string;
  positions: Position[];
  price: number;
  school: string;
}

interface PlayerTableProps {
  selectedPosition: Position | Position[] | null;
  onSelectPlayer: (player: Player) => void;
  selectedPlayers: Record<string, Player>;
  remainingBudget: number;
  leagueFormat: "offense" | "defense" | "both";
  availablePlayers: Player[];
}

const OFFENSIVE_POSITIONS: Position[] = [
  "QB",
  "RB",
  "WR",
  "TE",
  "OG",
  "OT",
  "C",
  "OL",
];
const DEFENSIVE_POSITIONS: Position[] = ["EDGE", "DT", "LB", "CB", "S"];

export function PlayerTable({
  selectedPosition,
  onSelectPlayer,
  selectedPlayers,
  remainingBudget,
  leagueFormat,
  availablePlayers,
}: PlayerTableProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPlayers = useMemo(() => {
    return availablePlayers
      .filter((player) => {
        const matchesPosition =
          !selectedPosition ||
          (Array.isArray(selectedPosition)
            ? selectedPosition.some((pos) => player.positions.includes(pos))
            : player.positions.includes(selectedPosition) ||
              (selectedPosition === "OL" &&
                ["OG", "OT", "C"].some((pos) =>
                  player.positions.includes(pos)
                )) ||
              (selectedPosition === "WR/RB/TE" &&
                ["WR", "RB", "TE"].some((pos) =>
                  player.positions.includes(pos)
                )));
        const matchesSearch =
          `${player.first_name} ${player.last_name}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          player.school.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFormat =
          leagueFormat === "both" ||
          (leagueFormat === "offense" &&
            player.positions.some((pos) =>
              OFFENSIVE_POSITIONS.includes(pos)
            )) ||
          (leagueFormat === "defense" &&
            player.positions.some((pos) => DEFENSIVE_POSITIONS.includes(pos)));
        return matchesPosition && matchesSearch && matchesFormat;
      })
      .sort((a, b) => b.price - a.price);
  }, [availablePlayers, selectedPosition, searchQuery, leagueFormat]);

  const canSelectPlayer = (player: Player) => remainingBudget >= player.price;

  const isPositionSelected = selectedPosition !== null;

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search players..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {!isPositionSelected ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Info className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Position Selected</h3>
            <p className="text-muted-foreground max-w-sm">
              Select a position from your roster to view available players.
            </p>
          </div>
        ) : (
          <div>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-medium">Name</TableHead>
                  <TableHead className="font-medium">Positions</TableHead>
                  <TableHead className="font-medium">School</TableHead>
                  <TableHead className="font-medium text-right">
                    Price
                  </TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlayers.map((player) => (
                  <TableRow key={player.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium text-[15px]">{`${player.first_name} ${player.last_name}`}</TableCell>
                    <TableCell className="text-[15px]">
                      {player.positions.join(", ")}
                    </TableCell>
                    <TableCell className="text-[15px]">
                      {player.school}
                    </TableCell>
                    <TableCell className="text-right font-medium text-[15px]">
                      ${player.price.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="default"
                        className="w-[80px]"
                        disabled={!canSelectPlayer(player)}
                        onClick={() => onSelectPlayer(player)}
                      >
                        Select
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

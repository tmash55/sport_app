"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Edit2,
  MoreVertical,
  CheckCircle2,
  Pencil,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { useNflDraft } from "@/app/context/NflDraftContext";
import { renameEntry } from "@/app/actions/entry-actions";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Player {
  id: string;
  first_name: string;
  last_name: string;
  positions: string[];
  price: number;
  school: string;
  is_drafted?: boolean;
  draft_position: number;
}

interface EntryCardProps {
  entry: {
    id: string;
    entry_name: string;
    roster: Record<string, Player>;
    status: "pre_draft" | "in_progress" | "completed" | "locked" | "not_started";
    points?: number;
    winningTeam?: string;
    createdAt: Date;
  };
  onEdit: (leagueId: string, id: string) => void;
  onDelete: (id: string) => void;
  pickDeadline: Date | null;
}

export function EntryCard({
  entry,
  onEdit,
  onDelete,
  pickDeadline,
}: EntryCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(entry.entry_name);
  const isLocked = pickDeadline ? new Date() > pickDeadline : false;
  const { players, refetchData, league } = useNflDraft();
  const [draftedCount, setDraftedCount] = useState(0);
  const [totalScore, setTotalScore] = useState(0);

  useEffect(() => {
    let drafted = 0;
    let score = 0;
    Object.values(entry.roster).forEach((player) => {
      if (player.is_drafted) {
        drafted++;
        score += player.draft_position;
      }
    });

    setDraftedCount(drafted);
    setTotalScore(score);
  }, [entry.roster]);

  const totalPlayers = Object.keys(entry.roster).length;
  const progress = (draftedCount / totalPlayers) * 100;

  const handleEditClick = () => {
    setEditedName(entry.entry_name);
    setIsEditing(true);
  };

  const handleSaveName = async () => {
    const trimmedName = editedName.trim();
    if (trimmedName.length === 0) {
      toast({
        title: "Error",
        description: "Entry name cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    if (trimmedName.length > 20) {
      toast({
        title: "Error",
        description: "Entry name must be 20 characters or less.",
        variant: "destructive",
      });
      return;
    }

    const result = await renameEntry(entry.id, trimmedName, league.id);
    if (result.success) {
      setIsEditing(false);
      refetchData();
      toast({
        title: "Entry name updated",
        description: "Your entry name has been successfully updated.",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to update entry name.",
        variant: "destructive",
      });
    }
  };
  

  const formatPlayerName = (
    positionKey: string,
    player: { first_name?: string; last_name?: string; name?: string }
  ) => {
    if (!player) return "Unknown Player";

    let formattedName = "Unknown Player";

    if (player.first_name && player.last_name) {
      formattedName = `${player.first_name.charAt(0)}. ${player.last_name}`;
    } else if (player.name) {
      // Fallback if only "name" is available
      const [firstName, lastName] = player.name.split(" ");
      formattedName = `${firstName.charAt(0)}. ${lastName}`;
    }

    // Extract the position from positionKey (e.g., "QB-0-0" → "QB")
    const positionLabel = positionKey.split("-")[0];

    return `${positionLabel}: ${formattedName}`;
  };

  return (
    <Card className="group relative hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-grow mr-2">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="h-7 py-1 text-lg font-semibold"
                />
                <Button size="sm" onClick={handleSaveName}>
                  Save
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg leading-none">
                  {entry.entry_name}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                  onClick={handleEditClick}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Created {format(entry.createdAt, "MMM d, yyyy")}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEditClick}>
                Rename Entry
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(entry.id)}
                className="text-destructive"
              >
                Delete Entry
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pb-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge
              variant={
                entry.status === "completed"
                  ? "success"
                  : entry.status === "in_progress"
                  ? "warning"
                  : "secondary"
              }
              className="gap-1"
            >
              {entry.status === "completed" ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : (
                <CheckCircle2 className="h-3 w-3" />
              )}
              {entry.status.replace("_", " ")}
            </Badge>
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary" />
              <span className="font-semibold">{totalScore} pts</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Draft Progress</span>
              <span className="font-medium">
                {draftedCount}/{totalPlayers} Players Drafted
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Roster</h4>
            <div className="text-sm leading-relaxed">
              {Object.entries(entry.roster).map(([position, player], index) => (
                <span
                  key={player.id}
                  className={cn(
                    "inline-block hover:opacity-80 transition-opacity",
                    player.is_drafted && "text-green-600 font-medium"
                  )}
                >
                  {formatPlayerName(position, player)}
                  {index < Object.keys(entry.roster).length - 1 && (
                    <span className="mx-1 text-muted-foreground">{" • "}</span>
                  )}
                </span>
              ))}
            </div>
          </div>

          {entry.winningTeam && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Winning Team:</span>
              <span className="font-medium">{entry.winningTeam}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full gap-2"
          variant={entry.status === "completed" ? "secondary" : "default"}
          onClick={() => onEdit(league.id, entry.id)}
          disabled={isLocked}
        >
          <Edit2 className="h-4 w-4" />
          {entry.status === "completed" ? "View Picks" : "Edit Picks"}
        </Button>
      </CardFooter>
    </Card>
  );
}

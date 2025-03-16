"use client";

import Link from "next/link";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trophy, Info, Clock } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface CreateEntryCardProps {
  currentEntries: number;
  maxEntries: number;
  isDeadlinePassed: boolean;
  createEntryUrl: string;
}

export function CreateEntryCard({
  currentEntries,
  maxEntries,
  isDeadlinePassed,
  createEntryUrl,
}: CreateEntryCardProps) {
  const canCreateEntry = currentEntries < maxEntries && !isDeadlinePassed;
  const remainingEntries = maxEntries - currentEntries;

  return (
    <Card
      className={`group relative hover:shadow-md transition-all duration-200 ${
        canCreateEntry
          ? "hover:border-primary border-dashed"
          : "border-dashed opacity-75"
      }`}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg leading-none">
              Create New Entry
            </h3>
            <p className="text-sm text-muted-foreground">
              Start your draft journey
            </p>
          </div>
          <Trophy className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="pb-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="gap-1">
              <Clock className="h-3 w-3" />
              {isDeadlinePassed ? "Deadline Passed" : "Open for Entry"}
            </Badge>
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm">
                {currentEntries}/{maxEntries} Used
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Entry Slots</span>
              <span className="font-medium">{remainingEntries} Remaining</span>
            </div>
            <Progress
              value={(currentEntries / maxEntries) * 100}
              className="h-2"
            />
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Entry Details</h4>
            <div className="text-sm leading-relaxed text-muted-foreground space-y-2">
              <p>• Select 8 players within budget</p>
              <p>• Mix of offensive and defensive players</p>
              <p>• Score points based on draft position</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-full">
                <Button
                  className="w-full gap-2"
                  variant={canCreateEntry ? "default" : "secondary"}
                  asChild
                  disabled={!canCreateEntry}
                >
                  <Link href={createEntryUrl}>
                    <Plus className="h-4 w-4" />
                    Create Entry
                  </Link>
                </Button>
              </div>
            </TooltipTrigger>
            {canCreateEntry ? (
              <TooltipContent>
                <p>Create a new entry now!</p>
              </TooltipContent>
            ) : (
              <TooltipContent>
                <p>
                  {isDeadlinePassed
                    ? "The entry deadline has passed"
                    : `Maximum ${maxEntries} entries allowed`}
                </p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </CardFooter>
    </Card>
  );
}

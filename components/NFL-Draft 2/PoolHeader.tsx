"use client";

import { Trophy, Users, Clock, ArrowUpRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PiFootballHelmetBold } from "react-icons/pi";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface PoolHeaderProps {
  name: string;
  sport: string;
  memberCount: number;
  draftStatus: string;
  entryFee?: string;
  entryDeadline?: string;
  onViewDetails?: () => void;
  className?: string;
  maxEntriesPerUser: number;
  rosterFormat: string;
  lockEntriesAt?: Date | null;
  id: string | null;
}

export function PoolHeader({
  name,
  sport,
  memberCount,
  draftStatus,
  entryFee = "$25",
  entryDeadline,
  onViewDetails,
  className,
  maxEntriesPerUser,
  rosterFormat,
  lockEntriesAt,
  id,
}: PoolHeaderProps) {
  const formatRosterType = (format: string) => {
    return format === "both"
      ? "Offense & Defense"
      : format.charAt(0).toUpperCase() + format.slice(1);
  };

  const isEntriesOpen = lockEntriesAt
    ? new Date() < new Date(lockEntriesAt)
    : true;

  return (
    <Card
      className={cn(
        "relative overflow-hidden bg-gradient-to-br from-background to-muted/50 backdrop-blur border shadow-md",
        className
      )}
    >
      <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
      <div className="p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
              {name}
            </h1>
            <p className="text-sm text-muted-foreground">NFL Draft Pool 2025</p>
          </div>
          <div className="flex items-center gap-3">
            {isEntriesOpen && (
              <Button variant="default" size="sm" className="gap-2" asChild>
                <Link href={`/dashboard/pools/nfl-draft/${id}/my-entries`}>
                  <Plus className="h-4 w-4" />
                  Create Entry
                </Link>
              </Button>
            )}
            {onViewDetails && (
              <Button
                variant="outline"
                size="sm"
                onClick={onViewDetails}
                className="gap-2 hover:shadow-md transition-all duration-200"
              >
                View Details
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Badge variant="outline" className="gap-1.5 text-sm py-1.5 px-3">
            <PiFootballHelmetBold className="h-4 w-4" />
            <span className="font-medium">NFL</span>
          </Badge>
          <Badge variant="outline" className="gap-1.5 text-sm py-1.5 px-3">
            <Users className="h-4 w-4" />
            <span>{memberCount} Members</span>
          </Badge>
          <Badge variant="outline" className="gap-1.5 text-sm py-1.5 px-3">
            <Trophy className="h-4 w-4" />
            <span>Max Entries: {maxEntriesPerUser}</span>
          </Badge>
          <Badge variant="outline" className="gap-1.5 text-sm py-1.5 px-3">
            <Clock className="h-4 w-4" />
            <span>Roster: {formatRosterType(rosterFormat)}</span>
          </Badge>
        </div>
      </div>
    </Card>
  );
}

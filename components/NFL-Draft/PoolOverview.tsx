"use client";

import type React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  CalendarDays,
  Users,
  ScrollText,
  Clock,
  DollarSign,
  Target,
  LockIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { InviteMembers } from "../leagues/InviteMembers";
import { cn } from "@/lib/utils";

interface PoolOverviewProps {
  memberCount: number;
  activeEntries: number;
  maxEntriesPerMember: number;
  importantDates: Array<{
    date: string;
    event: string;
    editButton?: React.ReactNode;
  }>;
  onEditDeadline?: () => void;
  isCommissioner: boolean;
  onOpenSettings: (section: string, scrollTo?: string) => void;
  leagueId: string;
}

export function PoolOverview({
  memberCount,
  activeEntries,
  maxEntriesPerMember,
  importantDates,
  onEditDeadline,
  onOpenSettings,
  isCommissioner,
  leagueId,
}: PoolOverviewProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Pool Members Card */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-muted/50">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-primary" />
            Pool Members
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="text-4xl font-bold tracking-tight bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
                  {memberCount}
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Members
                </p>
              </div>
              <div className="space-y-1">
                <div className="text-4xl font-bold tracking-tight bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
                  {activeEntries}
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active Entries
                </p>
              </div>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {memberCount}{" "}
                {memberCount === 1 ? "member has" : "members have"} joined the
                pool. There {activeEntries === 1 ? "is" : "are"} currently{" "}
                {activeEntries} active{" "}
                {activeEntries === 1 ? "entry" : "entries"}. Each member is
                allowed to submit up to {maxEntriesPerMember}{" "}
                {maxEntriesPerMember === 1 ? "entry" : "entries"}, which is set
                by the pool commissioner.
              </p>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="bg-muted/30 rounded-lg">
            <InviteMembers leagueId={leagueId} />
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-muted/50">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CalendarDays className="h-5 w-5 text-primary" />
            Important Dates
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ul className="space-y-4">
            {importantDates.map((item, index) => (
              <li
                key={index}
                className="group flex items-start gap-3 p-2 rounded-lg transition-colors hover:bg-muted/50"
              >
                <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="flex-grow">
                  <p
                    className={cn(
                      "font-medium",
                      (item.event === "Pool Entry Deadline" ||
                        item.event === "NFL Draft Day 1 (Round 1)") &&
                        "font-bold dark:text-primary"
                    )}
                  >
                    {item.event}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">{item.date}</p>
                    {item.event === "Pool Entry Deadline" && isCommissioner && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          onOpenSettings("settings", "poolSettingsForm")
                        }
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="overflow-hidden md:col-span-2">
        <CardHeader className="border-b bg-muted/50">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ScrollText className="h-5 w-5 text-primary" />
            NFL Draft Pool Rules
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ul className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: <DollarSign className="h-5 w-5" />,
                title: "Pick players within a set budget",
                description: "Manage your picks strategically",
              },
              {
                icon: <Target className="h-5 w-5" />,
                title: "Points awarded based on draft position",
                description: "Higher picks earn more points",
              },
              {
                icon: <LockIcon className="h-5 w-5" />,
                title: "Lock in picks before April 24, 2025",
                description: "No changes after deadline",
              },
            ].map((rule, index) => (
              <li
                key={index}
                className="flex items-start gap-3 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-all duration-300 ease-in-out hover:shadow-md hover:-translate-y-1"
              >
                <div className="mt-1 p-2 rounded-full bg-primary/10 text-primary">
                  {rule.icon}
                </div>
                <div>
                  <p className="font-medium">{rule.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {rule.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

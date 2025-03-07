"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface PoolSettingsFormProps {
  league: any;
  onUpdate: (updatedData: any) => Promise<void>;
  scrollToSection?: string;
}

export function PoolSettingsForm({
  league,
  onUpdate,
  scrollToSection,
}: PoolSettingsFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [poolName, setPoolName] = useState(league?.name || "")
  const settings = league?.settings ? JSON.parse(league.settings) : {};
  const [rosterType, setRosterType] = useState(settings.format || "offense");
  const [maxEntriesPerUser, setMaxEntriesPerUser] = useState(
    settings.max_entries_per_user || 3
  );
  const [isUnlimited, setIsUnlimited] = useState(
    settings.max_entries_per_user === null
  );
  const [maxRounds, setMaxRounds] = useState(
    String(settings.max_rounds || "7")
  );
  const [dqUndrafted, setDqUndrafted] = useState(
    settings.dq_undrafted === true
  );
  const rosterTypeRef = useRef<HTMLDivElement>(null);
  const entriesPerUserRef = useRef<HTMLDivElement>(null);
  const roundsToTrackRef = useRef<HTMLDivElement>(null);
  const dqUndraftedRef = useRef<HTMLDivElement>(null);
  const lockEntriesRef = useRef<HTMLDivElement>(null);
  const dateInputRef = useRef<HTMLButtonElement>(null);

  const nflDraftStart = new Date("2025-04-24T20:00:00-04:00");
  const [date, setDate] = useState<Date | undefined>(
    settings.lock_entries_at
      ? new Date(settings.lock_entries_at)
      : new Date("2025-04-24T19:00:00-04:00")
  );
  const [time, setTime] = useState(
    settings.lock_entries_at
      ? format(new Date(settings.lock_entries_at), "HH:mm")
      : "19:00"
  );
  useEffect(() => {
    if (scrollToSection) {
      const sectionRefs = {
        rosterType: rosterTypeRef,
        entriesPerUser: entriesPerUserRef,
        roundsToTrack: roundsToTrackRef,
        dqUndrafted: dqUndraftedRef,
        lockEntries: lockEntriesRef,
      };
      const ref = sectionRefs[scrollToSection as keyof typeof sectionRefs];
      if (ref && ref.current) {
        ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [scrollToSection]);

  useEffect(() => {
    if (scrollToSection && dateInputRef.current) {
      dateInputRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [scrollToSection]);

  useEffect(() => {
    if (isUnlimited) {
      setMaxEntriesPerUser(null);
    } else if (maxEntriesPerUser === null) {
      setMaxEntriesPerUser(3);
    }
  }, [isUnlimited, maxEntriesPerUser]);

  useEffect(() => {
    if (date) {
      const selectedDateTime = new Date(date);
      const [hours, minutes] = time.split(":").map(Number);
      selectedDateTime.setHours(hours, minutes);

      if (selectedDateTime > nflDraftStart) {
        // If on draft day, set to last valid time, otherwise set to 7 PM
        if (
          format(date, "yyyy-MM-dd") === format(nflDraftStart, "yyyy-MM-dd")
        ) {
          setTime("20:00"); // 8:00 PM
        } else {
          setTime("19:00");
        }
      }
    }
  }, [date, nflDraftStart, time]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!date) {
        throw new Error("Please select a date");
      }

      const [hours, minutes] = time.split(":").map(Number);
      const lockDateTime = new Date(date);
      lockDateTime.setHours(hours, minutes);

      if (lockDateTime > nflDraftStart) {
        throw new Error(
          "Lock time must be no later than when the NFL draft starts"
        );
      }

      const updatedSettings = {
        ...settings,
        format: rosterType,
        max_entries_per_user: isUnlimited ? null : maxEntriesPerUser,
        lock_entries_at: lockDateTime.toISOString(),
        max_rounds: Number.parseInt(maxRounds, 10),
        dq_undrafted: dqUndrafted,
      };
      // If the name has changed, update both name and settings
      if (poolName !== league?.name) {
        await onUpdate({
          name: poolName,
          settings: JSON.stringify(updatedSettings),
        })
      } else {
        // Otherwise just update settings
        await onUpdate({
          settings: JSON.stringify(updatedSettings),
        })
      }
      toast({
        title: "Settings updated",
        description: "Your pool settings have been successfully updated.",
      });
    } catch (error) {
      console.error("Failed to update settings:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Pool Settings</h2>

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
            <CardHeader>
              <CardTitle>Pool Name</CardTitle>
              <CardDescription>Update the name of your pool.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="poolName">Pool Name</Label>
                <Input
                  id="poolName"
                  value={poolName}
                  onChange={(e) => setPoolName(e.target.value)}
                  placeholder="Enter pool name"
                  className="max-w-md"
                />
              </div>
            </CardContent>
          </Card>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Roster Type</CardTitle>
            <CardDescription>
              Choose which player positions will be available for selection in
              the draft pool.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={rosterType}
              onValueChange={setRosterType}
              className="space-y-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="offense" id="offense" />
                <Label htmlFor="offense">
                  Offense Only (QB, RB, WR, TE, OL)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="defense" id="defense" />
                <Label htmlFor="defense">Defense Only (DL, LB, DB)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="both" id="both" />
                <Label htmlFor="both">Both (All positions included)</Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Entries per User</CardTitle>
            <CardDescription>
              Set the maximum number of entries allowed per user in this pool.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  id="maxEntries"
                  value={isUnlimited ? "" : maxEntriesPerUser || ""}
                  onChange={(e) =>
                    setMaxEntriesPerUser(Number(e.target.value) || 1)
                  }
                  min={1}
                  disabled={isUnlimited}
                  className="w-20"
                />
                <Label htmlFor="maxEntries">Maximum Entries</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="unlimited"
                  checked={isUnlimited}
                  onCheckedChange={(checked) =>
                    setIsUnlimited(checked as boolean)
                  }
                />
                <Label htmlFor="unlimited">Unlimited entries</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Rounds to Track</CardTitle>
            <CardDescription>
              Select how many rounds of the NFL Draft will count toward scoring.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={maxRounds}
              onValueChange={setMaxRounds}
              className="space-y-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1" id="round-1" />
                <Label htmlFor="round-1">
                  1 Round (First Round Only - High Stakes)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3" id="round-3" />
                <Label htmlFor="round-3">
                  3 Rounds (Days 1 & 2 - More Competitive)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="7" id="round-7" />
                <Label htmlFor="round-7">
                  7 Rounds (Entire Draft - Full Strategy Mode)
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Disqualify Undrafted Players</CardTitle>
            <CardDescription>
              Decide how to handle entries with players who go undrafted.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={dqUndrafted ? "true" : "false"}
              onValueChange={(value) => setDqUndrafted(value === "true")}
              className="space-y-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id="dq-true" />
                <Label htmlFor="dq-true">
                  True (Any entry with an undrafted player is automatically
                  DQ&apos;d)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id="dq-false" />
                <Label htmlFor="dq-false">
                  False (Undrafted players score 258 points, and the entry
                  remains active)
                </Label>
              </div>
            </RadioGroup>
            <p className="text-sm text-muted-foreground mt-2">
              Note: There are 257 draft picks in the draft, so undrafted players
              will receive 258 points if not disqualified.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6" ref={lockEntriesRef}>
          <CardHeader>
            <CardTitle>Lock Entries At</CardTitle>
            <CardDescription>
              Set the date and time when entries will be locked for this pool.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="grid gap-2 flex-1">
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        defaultMonth={date}
                        initialFocus
                        disabled={(date) => {
                          const dateTime = new Date(date);
                          return dateTime > nflDraftStart || date < new Date();
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid gap-2">
                  <Label>Time</Label>
                  <Select value={time} onValueChange={setTime}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 33 })
                        .map((_, i) => {
                          const hour = Math.floor(i / 4) + 16; // Start from 4 PM
                          const minute = (i % 4) * 15;
                          const timeString = `${hour
                            .toString()
                            .padStart(2, "0")}:${minute
                            .toString()
                            .padStart(2, "0")}`;

                          // Create a new date object combining selected date and current time option
                          const currentDateTime = new Date(date || new Date());
                          currentDateTime.setHours(hour, minute);

                          // Disable times after 8 PM on April 24, 2025
                          if (
                            format(currentDateTime, "yyyy-MM-dd") ===
                              format(nflDraftStart, "yyyy-MM-dd") &&
                            currentDateTime > nflDraftStart
                          ) {
                            return null;
                          }

                          return (
                            <SelectItem key={timeString} value={timeString}>
                              {format(
                                new Date().setHours(hour, minute),
                                "h:mm a"
                              )}
                            </SelectItem>
                          );
                        })
                        .filter(Boolean)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                The NFL draft starts on April 24, 2025 at 8:00 PM ET. You can
                set the lock time to any time up to and including 8:00 PM ET on
                April 24, 2025.
              </p>
            </div>
          </CardContent>
        </Card>

        <CardFooter>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardFooter>
      </form>
    </div>
  );
}

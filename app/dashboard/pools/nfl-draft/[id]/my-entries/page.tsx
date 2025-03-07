"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { EntryCard } from "@/components/NFL-Draft/EntryCard";
import { CreateEntryCard } from "@/components/NFL-Draft/CreateEntryCard";
import { Button } from "@/components/ui/button";
import { Plus, Info } from "lucide-react";
import { useNflDraft } from "@/app/context/NflDraftContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/app/context/UserProvider";
import { deleteEntry } from "@/app/actions/entry-actions";
import { toast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
export type Position =
  | "EDGE"
  | "QB"
  | "WR"
  | "RB"
  | "TE"
  | "OT"
  | "OG"
  | "C"
  | "DT"
  | "LB"
  | "CB"
  | "S"
  | "OL"
  | "WR/RB/TE";

interface Player {
  id: string;
  first_name: string;
  last_name: string;
  positions: Position[];
  price: number;
  school: string;
  is_drafted: boolean;
  draft_position: number;
  name: string;
}

interface Entry {
  user_id: any;
  id: string;
  entry_name: string;
  league_member_id: string;
  roster: Record<string, Player>;
  points: number;
  drafted_count: number;
}

export default function MyEntriesPage() {
  const router = useRouter();
  const { user } = useUser();
  const { league, entries, loading, refetchData } = useNflDraft();
  const [userEntries, setUserEntries] = useState<Entry[]>([]);

  useEffect(() => {
    if (!user || !league) return;
  
    setUserEntries(
      entries.filter((entry) =>
        league?.league_members.some(
          (member: any) => member.id === entry.league_member_id && member.user_id === user?.id
        )
      )
    );
  }, [entries, user, league]);

  if (loading) {
    return <EntriesPageSkeleton />;
  }

  if (!league) {
    return <div>League not found</div>;
  }

  const settings = league.settings ? JSON.parse(league.settings) : {};
 

  
  
  const maxEntries = settings.max_entries_per_user || 1;
  const pickDeadline = settings.lock_entries_at
    ? new Date(settings.lock_entries_at)
    : null;
  const isDeadlinePassed = pickDeadline ? new Date() > pickDeadline : false;
  const userEntriesCount = userEntries.length;
  const canCreateEntry = userEntriesCount < maxEntries && !isDeadlinePassed;
  
  const handleEditEntry = (leagueId: string, entryId: string) => {
    console.log("Navigating to edit entry page");
    console.log("League ID:", leagueId);
    console.log("Entry ID:", entryId);

    router.push(
      `/dashboard/pools/nfl-draft/${leagueId}/my-entries/${entryId}/edit`
    );
  };

  const getStatus = () => {
    const now = new Date();
    const pickDeadline = settings.lock_entries_at ? new Date(settings.lock_entries_at) : null;
    const draftStartDate = settings.draft_start_date ? new Date(settings.draft_start_date) : null;
    const contestStatus = league?.contest_id?.status || "pending";
  
    if (pickDeadline && now < pickDeadline) {
      return "pre_draft"; // Before pick deadline & draft
    } else if (pickDeadline && now >= pickDeadline && draftStartDate && now < draftStartDate) {
      return "locked"; // After pick deadline but before draft
    } else if (draftStartDate && now >= draftStartDate && contestStatus !== "completed") {
      return "in_progress"; // Draft has started but contest is ongoing
    } else if (contestStatus === "completed") {
      return "completed"; // Contest is completed
    }
  
    return "not_started"; // Default fallback
  };
  
  const status = getStatus(); // ✅ Compute once
  console.log("Status", status)
  

  const handleDeleteEntry = async (id: string) => {
    try {
      if (!user?.id) {
        console.error("User not authenticated");
        return;
      }

      await deleteEntry(id, league.id, user.id); // Pass user ID

      await refetchData(); // Refresh UI after deletion
    } catch (error) {
      console.error("Unexpected error deleting entry:", error);
    }
  };
  const handleCreateEntry = () => {
    if (!canCreateEntry) {
      toast({
        title: "Cannot Create Entry",
        description: isDeadlinePassed
          ? "The entry deadline has passed"
          : `Maximum ${maxEntries} entries allowed`,
        variant: "default",
      });
      return;
    }
    router.push(`/dashboard/pools/nfl-draft/${league.id}/my-entries/create`);
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Your Draft Entries
          </h1>
          <div className="flex items-center gap-6">
            <p className="text-muted-foreground">
              Pick deadline:{" "}
              {pickDeadline
                ? format(pickDeadline, "MMMM d, yyyy 'at' h:mm a 'ET'")
                : "Not set"}
            </p>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>•</span>
              <TooltipProvider>
                <Tooltip>
                <TooltipTrigger className="flex items-center gap-1.5">
                  <span>
                    {userEntriesCount}/{maxEntries} Entries
                  </span>
                  <Info className="h-4 w-4" />
                </TooltipTrigger>

                  <TooltipContent>
                    <p>
                      You can create up to {maxEntries} entries in this pool
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
        <Button
          onClick={handleCreateEntry}
          disabled={!canCreateEntry}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Entry
        </Button>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {entries
          .filter((entry) =>
            league?.league_members.some(
              (member: any) => member.id === entry.league_member_id && member.user_id === user?.id
            )
          ) // ✅ Ensure entry belongs to the logged-in user
          .map((entry) => (
            <EntryCard
            key={entry.id}
            entry={{
              id: entry.id,
              entry_name: entry.entry_name,
              roster: entry.roster,
              status,  // ✅ Dynamically assign status
              points: entry.points,
              createdAt: new Date(entry.created_at),
            }}
            onEdit={handleEditEntry}
            onDelete={handleDeleteEntry}
            pickDeadline={pickDeadline}
          />
          

                  ))}
        </div>


      <div className="mt-8 text-sm text-muted-foreground">
        <p>* Entries cannot be modified after the pick deadline</p>
        <p>
          * The entries will be available once the players price tags are
          announced
        </p>
      </div>
    </div>
  );
}

function EntriesPageSkeleton() {
  return (
    <div className="container max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-5 w-48" />
        </div>
        <Skeleton className="h-9 w-36" />
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
    </div>
  );
}


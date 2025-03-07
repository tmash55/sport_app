"use client";

import { useState } from "react";
import { PoolHeader } from "@/components/NFL-Draft/PoolHeader";
import { PoolOverview } from "@/components/NFL-Draft/PoolOverview";
import { CommishHQDialog } from "@/components/NFL-Draft/CommishHQDialog";
import { useNflDraft } from "@/app/context/NflDraftContext";

export default function PoolPage() {
  const { league, entries, isCommissioner, loading } = useNflDraft();
  const [isCommishHQOpen, setIsCommishHQOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("main");
  const [scrollToSection, setScrollToSection] = useState<string | undefined>(
    undefined
  );

  if (loading) return <div>Loading...</div>;
  if (!league) return <div>League not found</div>;

  const memberCount = league.league_members?.length || 0;
  const draftStatus = league.drafts?.status || "Not Set";
  const sport = league.contest?.sport || "football";

  const settings = league.settings ? JSON.parse(league.settings) : {};
  const maxEntries = settings.max_entries_per_user || 1;
  const rosterFormat = settings.format || "both";
  const lockEntriesAt = settings.lock_entries_at
    ? new Date(settings.lock_entries_at)
    : null;

  const formatDate = (date: Date | null) => {
    return date
      ? date.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "numeric",
          timeZone: "America/New_York",
        })
      : "Not Set";
  };

  const handleOpenSettings = (section: string, scrollTo?: string) => {
    setActiveSection(section);
    setScrollToSection(scrollTo);
    setIsCommishHQOpen(true);
  };

  const poolOverviewData = {
    memberCount: memberCount,
    activeEntries: entries.length,
    maxEntriesPerMember: maxEntries,
    importantDates: [
      { date: formatDate(lockEntriesAt), event: "Pool Entry Deadline" },
      { date: "April 24, 2025", event: "NFL Draft Day 1 (Round 1)" },
      { date: "April 25, 2025", event: "NFL Draft Day 2 (Rounds 2-3)" },
      { date: "April 26, 2025", event: "NFL Draft Day 3 (Rounds 4-7)" },
    ],
    onOpenSettings: (section: string, scrollTo?: string) =>
      handleOpenSettings(section, scrollTo),
    isCommissioner: isCommissioner,
    leagueId: league.id, // Add this line to include leagueId in poolOverviewData
  };

  return (
    <div className="space-y-6">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="py-6">
          <PoolHeader
            name={league.name}
            sport={sport}
            memberCount={memberCount}
            draftStatus={draftStatus}
            maxEntriesPerUser={maxEntries}
            rosterFormat={rosterFormat}
            lockEntriesAt={lockEntriesAt}
            id={league.id}
          />
        </div>

        <PoolOverview {...poolOverviewData} />
      </div>
      <CommishHQDialog
        initialSection={activeSection as "main" | "settings"}
        initialScrollSection={scrollToSection}
        isOpen={isCommishHQOpen}
        onOpenChange={setIsCommishHQOpen}
      >
        <span style={{ display: "none" }} />
      </CommishHQDialog>
    </div>
  );
}

"use client"

import { Suspense } from "react"
import { useState } from "react"
import { PoolHeader } from "@/components/NFL-Draft/PoolHeader"
import { PoolOverview } from "@/components/NFL-Draft/PoolOverview"
import { CommishHQDialog } from "@/components/NFL-Draft/CommishHQDialog"
import { useNflDraft } from "@/app/context/NflDraftContext"
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

// Skeleton for the PoolOverview component
const PoolOverviewSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <Card className="p-6 col-span-1 md:col-span-2 space-y-4">
      <Skeleton className="h-7 w-40 mb-4" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />
      </div>
      <div className="pt-4">
        <Skeleton className="h-10 w-32" />
      </div>
    </Card>

    <div className="space-y-6">
      <Card className="p-6 space-y-4">
        <Skeleton className="h-7 w-40 mb-2" />
        <div className="space-y-3">
          <div className="flex justify-between">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-16" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-16" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <Skeleton className="h-7 w-40 mb-2" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-24" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  </div>
)

export default function PoolPage() {
  const { league, entries, isCommissioner, loading } = useNflDraft()
  const [isCommishHQOpen, setIsCommishHQOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("main")
  const [scrollToSection, setScrollToSection] = useState<string | undefined>(undefined)

  // Prepare data for when it's loaded
  const getPoolData = () => {
    if (!league) return null

    const memberCount = league.league_members?.length || 0
    const draftStatus = league.drafts?.status || "Not Set"
    const sport = league.contest?.sport || "football"

    const settings = league.settings ? JSON.parse(league.settings) : {}
    const maxEntries = settings.max_entries_per_user || 1
    const rosterFormat = settings.format || "both"
    const lockEntriesAt = settings.lock_entries_at ? new Date(settings.lock_entries_at) : null

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
        : "Not Set"
    }

    const handleOpenSettings = (section: string, scrollTo?: string) => {
      setActiveSection(section)
      setScrollToSection(scrollTo)
      setIsCommishHQOpen(true)
    }

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
      onOpenSettings: (section: string, scrollTo?: string) => handleOpenSettings(section, scrollTo),
      isCommissioner: isCommissioner,
      leagueId: league.id,
    }

    return {
      league,
      memberCount,
      draftStatus,
      sport,
      maxEntries,
      rosterFormat,
      lockEntriesAt,
      poolOverviewData,
    }
  }

  const poolData = getPoolData()

  // If there's an error loading the league
  if (!loading && !league) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold">League not found</h2>
          <p className="text-muted-foreground mt-2">
            The league you're looking for doesn't exist or you don't have access to it.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="py-6">
          <Suspense
            fallback={
              <PoolHeader
                isLoading={true}
                name=""
                sport=""
                memberCount={0}
                draftStatus=""
                maxEntriesPerUser={0}
                rosterFormat=""
                id={null}
              />
            }
          >
            {loading ? (
              <PoolHeader
                isLoading={true}
                name=""
                sport=""
                memberCount={0}
                draftStatus=""
                maxEntriesPerUser={0}
                rosterFormat=""
                id={null}
              />
            ) : (
              poolData && (
                <PoolHeader
                  name={poolData.league.name}
                  sport={poolData.sport}
                  memberCount={poolData.memberCount}
                  draftStatus={poolData.draftStatus}
                  maxEntriesPerUser={poolData.maxEntries}
                  rosterFormat={poolData.rosterFormat}
                  lockEntriesAt={poolData.lockEntriesAt}
                  id={poolData.league.id}
                />
              )
            )}
          </Suspense>
        </div>

        <Suspense fallback={<PoolOverviewSkeleton />}>
          {loading ? <PoolOverviewSkeleton /> : poolData && <PoolOverview {...poolData.poolOverviewData} />}
        </Suspense>
      </div>

      {!loading && poolData && (
        <CommishHQDialog
          initialSection={activeSection as "main" | "settings"}
          initialScrollSection={scrollToSection}
          isOpen={isCommishHQOpen}
          onOpenChange={setIsCommishHQOpen}
        >
          <span style={{ display: "none" }} />
        </CommishHQDialog>
      )}
    </div>
  )
}


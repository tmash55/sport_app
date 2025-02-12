"use client"

import { Suspense, useState, useMemo } from "react"
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader"
import { DashboardTabs } from "@/components/Dashboard/DashboardTabs"
import { LeagueGrid } from "@/components/Dashboard/LeagueGrid"
import { Skeleton } from "@/components/ui/skeleton"
import { useLeagues } from "@/app/context/LeaguesContext"

export default function MyPoolsPage() {
  const { leagues, userId } = useLeagues()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [sortBy, setSortBy] = useState("date")

  const filteredLeagues = useMemo(() => {
    if (!leagues) return []
    console.log("All leagues:", leagues)

    return leagues
      .filter((league: any) => {
        const matchesSearch =
          league.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          league.contests.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          league.contests.sport.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesTab =
          activeTab === "all" ||
          (activeTab === "active" && league.contests.status === "active") ||
          (activeTab === "completed" && league.status === "completed") ||
          (activeTab === "draft" && league.status === "draft") ||
          (activeTab === "in_progress" && league.status === "in_progress")

        return matchesSearch && matchesTab
      })
      .sort((a: any, b: any) => {
        if (sortBy === "name") return a.name.localeCompare(b.name)
        if (sortBy === "date") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        if (sortBy === "members") return b.member_count[0].count - a.member_count[0].count
        if (sortBy === "contest") return a.contests.name.localeCompare(b.contests.name)
        return 0
      })
  }, [leagues, searchQuery, activeTab, sortBy])

  if (!leagues || !userId) {
    return <Skeleton className="h-[400px] w-full" />
  }

  return (
    <div className="container max-w-7xl mx-auto p-4">
      <DashboardHeader />
      <Suspense fallback={<Skeleton className="h-[100px] w-full" />}>
        <DashboardTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sortBy={sortBy}
          setSortBy={setSortBy}
          leagueCount={filteredLeagues.length}
        />
      </Suspense>
      <Suspense
        fallback={
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-[200px] rounded-lg" />
            ))}
          </div>
        }
      >
        <LeagueGrid leagues={filteredLeagues} userId={userId} />
      </Suspense>
    </div>
  )
}


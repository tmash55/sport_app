"use client"

import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Search, SlidersHorizontal } from "lucide-react"

interface DashboardTabsProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  sortBy: string
  setSortBy: (sort: string) => void
  leagueCount: number
}

export function DashboardTabs({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  leagueCount,
}: DashboardTabsProps) {
  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <TabsList className="grid grid-cols-3 lg:grid-cols-4 w-full sm:w-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="draft">Draft</TabsTrigger>
            <TabsTrigger value="active" className="hidden lg:inline-flex">
              Active
            </TabsTrigger>
            <TabsTrigger value="completed" className="hidden lg:inline-flex">
              Completed
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, sport, or contest"
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="sr-only">Sort pools</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => setSortBy("name")}>Sort by Name</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setSortBy("date")}>Sort by Date</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setSortBy("members")}>Sort by Members</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setSortBy("contest")}>Sort by Contest</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <TabsContent value="all" className="mt-6">
          <h2 className="text-2xl font-semibold mb-8">All Pools ({leagueCount})</h2>
        </TabsContent>
        <TabsContent value="draft" className="mt-4">
          <h2 className="text-2xl font-semibold mb-4">Draft Pools ({leagueCount})</h2>
        </TabsContent>
        <TabsContent value="in_progress" className="mt-4">
          <h2 className="text-2xl font-semibold mb-4">In Progress ({leagueCount})</h2>
        </TabsContent>
        <TabsContent value="active" className="mt-4">
          <h2 className="text-2xl font-semibold mb-4">Active Pools ({leagueCount})</h2>
        </TabsContent>
        <TabsContent value="completed" className="mt-4">
          <h2 className="text-2xl font-semibold mb-4">Completed Pools ({leagueCount})</h2>
        </TabsContent>
      </Tabs>
    </div>
  )
}


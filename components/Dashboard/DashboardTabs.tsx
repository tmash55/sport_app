"use client"

import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Search, SlidersHorizontal } from 'lucide-react'

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
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <TabsList className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground w-full md:w-auto">
              <TabsTrigger 
                value="all" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                All
              </TabsTrigger>
              <TabsTrigger 
                value="draft"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                Draft
              </TabsTrigger>
              <TabsTrigger 
                value="active"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                Active
              </TabsTrigger>
              <TabsTrigger 
                value="completed"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                Completed
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 md:w-[200px] md:flex-none">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search pools..."
                  className="pl-8 h-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                    <SlidersHorizontal className="h-4 w-4" />
                    <span className="sr-only">Sort pools</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[150px]">
                  <DropdownMenuItem onSelect={() => setSortBy("name")}>Sort by Name</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setSortBy("date")}>Sort by Date</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setSortBy("members")}>Sort by Members</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setSortBy("contest")}>Sort by Contest</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <TabsContent value="all" className="my-4">
            <h2 className="text-xl font-semibold">All Pools ({leagueCount})</h2>
          </TabsContent>
          <TabsContent value="draft" className="my-4 ">
            <h2 className="text-xl font-semibold">Draft Pools ({leagueCount})</h2>
          </TabsContent>
          <TabsContent value="active" className="my-4">
            <h2 className="text-xl font-semibold">Active Pools ({leagueCount})</h2>
          </TabsContent>
          <TabsContent value="completed" className="my-4">
            <h2 className="text-xl font-semibold">Completed Pools ({leagueCount})</h2>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
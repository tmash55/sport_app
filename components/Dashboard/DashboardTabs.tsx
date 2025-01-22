'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Search, SlidersHorizontal } from 'lucide-react'

interface Contest {
  id: string
  name: string
  contest_type: string
  sport: string
}

interface League {
  id: string
  name: string
  commissioner_id: string
  contest_id: string
  contests: Contest
  member_count: { count: number }[]
  created_at: string
  status: string
}

interface DashboardTabsProps {
  leagues: League[]
}

export function DashboardTabs({ leagues }: DashboardTabsProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [sortBy, setSortBy] = useState('name')

  const filteredLeagues = useMemo(() => {
    return leagues.filter(league => {
      const matchesSearch = league.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          league.contests?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          league.contests?.sport.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesTab = activeTab === 'all' || 
                        (activeTab === 'active' && league.status === 'active') || 
                        (activeTab === 'completed' && league.status === 'completed') ||
                        (activeTab === 'draft' && league.status === 'draft') ||
                        (activeTab === 'in_progress' && league.status === 'in_progress')
      
      return matchesSearch && matchesTab
    }).sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'date') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      if (sortBy === 'members') return b.member_count[0].count - a.member_count[0].count
      if (sortBy === 'contest') return a.contests.name.localeCompare(b.contests.name)
      return 0
    })
  }, [leagues, searchQuery, activeTab, sortBy])
  


  return (
    <div className="space-y-4">
      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <TabsList className="grid grid-cols-3 lg:grid-cols-5 w-full sm:w-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="draft">Draft</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress</TabsTrigger>
            <TabsTrigger value="active" className="hidden lg:inline-flex">Active</TabsTrigger>
            <TabsTrigger value="completed" className="hidden lg:inline-flex">Completed</TabsTrigger>
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
                <DropdownMenuItem onSelect={() => setSortBy('name')}>Sort by Name</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setSortBy('date')}>Sort by Date</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setSortBy('members')}>Sort by Members</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setSortBy('contest')}>Sort by Contest</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <TabsContent value="all" className="mt-4">
          <h2 className="text-2xl font-semibold mb-4">All Pools ({filteredLeagues.length})</h2>
        </TabsContent>
        <TabsContent value="draft" className="mt-4">
          <h2 className="text-2xl font-semibold mb-4">Draft Pools ({filteredLeagues.length})</h2>
        </TabsContent>
        <TabsContent value="in_progress" className="mt-4">
          <h2 className="text-2xl font-semibold mb-4">In Progress ({filteredLeagues.length})</h2>
        </TabsContent>
        <TabsContent value="active" className="mt-4">
          <h2 className="text-2xl font-semibold mb-4">Active Pools ({filteredLeagues.length})</h2>
        </TabsContent>
        <TabsContent value="completed" className="mt-4">
          <h2 className="text-2xl font-semibold mb-4">Completed Pools ({filteredLeagues.length})</h2>
        </TabsContent>
      </Tabs>
    </div>
  )
}


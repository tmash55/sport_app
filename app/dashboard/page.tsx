
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader"
import { PoolCard } from "@/components/Dashboard/PoolCard"
import { CreatePoolModal } from "@/components/Dashboard/CreatePoolModal"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const userPools = [
  { name: "March Madness 2024", sport: "Basketball", participants: 64, startDate: "Mar 19, 2024", status: "upcoming", userRank: 12, totalTeams: 64 },
  { name: "NFL Playoffs 2024", sport: "Football", participants: 32, startDate: "Jan 13, 2024", status: "active", userRank: 5, totalTeams: 32 },
  { name: "MLB World Series", sport: "Baseball", participants: 16, startDate: "Oct 1, 2024", status: "upcoming" },
  { name: "The Masters 2024", sport: "Golf", participants: 128, startDate: "Apr 11, 2024", status: "upcoming", userRank: 45, totalTeams: 128 },
  { name: "NBA Finals 2023", sport: "Basketball", participants: 16, startDate: "Jun 1, 2023", status: "completed", userRank: 3, totalTeams: 16 },
  { name: "Super Bowl LVIII", sport: "Football", participants: 2, startDate: "Feb 11, 2024", status: "upcoming", userRank: 1, totalTeams: 2 },
]

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <DashboardHeader />
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">My Pools and Leagues</h2>
        <CreatePoolModal />
      </div>
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {userPools.map((pool, index) => (
              <PoolCard key={index} {...pool} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="active" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {userPools.filter(pool => pool.status === "active").map((pool, index) => (
              <PoolCard key={index} {...pool} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="upcoming" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {userPools.filter(pool => pool.status === "upcoming").map((pool, index) => (
              <PoolCard key={index} {...pool} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="completed" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {userPools.filter(pool => pool.status === "completed").map((pool, index) => (
              <PoolCard key={index} {...pool} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}


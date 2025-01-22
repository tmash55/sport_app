"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Settings, Users2, Trophy, ListTodo, BarChart3 } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const navigationItems = [
  {
    label: "Draft",
    icon: ListTodo,
    href: (id: string) => `/dashboard/leagues/${id}`,
    value: "draft",
  },
  {
    label: "Team",
    icon: Users2,
    href: (id: string) => `/dashboard/leagues/${id}/team`,
    value: "team",
  },
  {
    label: "Standings",
    icon: Trophy,
    href: (id: string) => `/dashboard/leagues/${id}/standings`,
    value: "standings",
  },
  {
    label: "League",
    icon: BarChart3,
    href: (id: string) => `/dashboard/leagues/${id}/overview`,
    value: "league",
  },
]

export function LeagueNavigation({ leagueId }: { leagueId: string }) {
  const pathname = usePathname()

  // Helper function to determine if a path is active
  const isActivePath = (path: string) => pathname === path

  // Helper function to determine active tab value
  const getActiveTabValue = () => {
    if (pathname === `/dashboard/leagues/${leagueId}`) return "draft"
    if (pathname.includes("/team")) return "team"
    if (pathname.includes("/standings")) return "standings"
    if (pathname.includes("/overview")) return "league"
    return "draft"
  }

  return (
    <>
      {/* Mobile Navigation - Tabs */}
      <div className="md:hidden">
        <Tabs defaultValue={getActiveTabValue()} className="w-full">
          <TabsList className="w-full">
            {navigationItems.map((item) => (
              <TabsTrigger key={item.value} value={item.value} asChild className="flex-1">
                <Link href={item.href(leagueId)}>
                  <item.icon className="h-4 w-4 md:mr-2" />
                  <span className="sr-only md:not-sr-only">{item.label}</span>
                </Link>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Desktop Navigation - Cards */}
      <div className="hidden md:grid grid-cols-4 gap-4">
        {navigationItems.map((item) => {
          const isActive = isActivePath(item.href(leagueId))
          return (
            <Link key={item.label} href={item.href(leagueId)} className="block">
              <div
                className={`
                flex items-center gap-3 p-4 rounded-lg border transition-all
                hover:bg-accent hover:text-accent-foreground
                ${isActive ? "bg-primary/10 border-primary/20 shadow-sm" : "bg-card hover:border-accent"}
              `}
              >
                <item.icon className={`h-5 w-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                <span className="font-medium">{item.label}</span>
              </div>
            </Link>
          )
        })}
      </div>
    </>
  )
}


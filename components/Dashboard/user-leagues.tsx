"use client"

import { useMemo, useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown } from "lucide-react"
import {
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarMenuSkeleton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { PiFootballHelmetBold, PiGolf, PiTrophy, PiBasketball } from "react-icons/pi"
import { IoMdFootball } from "react-icons/io"
import { MdSportsSoccer } from "react-icons/md"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface League {
  id: string
  name: string
  status: "active" | "archived" | "upcoming"
  contests: {
    sport: string
    name: string
  }
}

interface GroupedLeagues {
  [key: string]: League[]
}

interface UserLeaguesProps {
  leagues: League[] | undefined
  isLoading: boolean
  error: Error | null
}

export function UserLeagues({ leagues, isLoading, error }: UserLeaguesProps) {
  const pathname = usePathname()
  const [openSports, setOpenSports] = useState<string[]>([])

  const groupedLeagues = useMemo(() => {
    if (!leagues) return {}
    return leagues.reduce((acc: GroupedLeagues, league: League) => {
      const sport = league.contests.sport
      if (!acc[sport]) {
        acc[sport] = []
      }
      acc[sport].push(league)
      return acc
    }, {})
  }, [leagues])

  // Set all sports to open by default
  useEffect(() => {
    if (leagues) {
      const allSports = Object.keys(groupedLeagues)
      setOpenSports(allSports)
    }
  }, [leagues, groupedLeagues])

  const toggleSport = (sport: string) => {
    setOpenSports((prev) => (prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport]))
  }
  const getContestPath = (contestName: string) => {
    return contestName.toLowerCase().replace(/\s+/g, '-')
  }

  const getSportIcon = (sport: string) => {
    switch (sport.toLowerCase()) {
      case "ncaab":
        return <PiBasketball className="w-5 h-5 mr-2 text-orange-500 dark:text-orange-400" />
      case "pga":
        return <PiGolf className="w-5 h-5 mr-2 text-green-500 dark:text-green-400" />
      case "football":
        return <PiFootballHelmetBold className="w-5 h-5 mr-2 text-brown-500" />
      case "soccer":
        return <MdSportsSoccer className="w-5 h-5 mr-2 text-blue-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: League["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "archived":
        return "bg-gray-400"
      case "upcoming":
        return "bg-yellow-500"
      default:
        return "bg-primary"
    }
  }

  if (isLoading) {
    return (
      <>
        {[...Array(3)].map((_, index) => (
          <SidebarGroup key={index}>
            <SidebarGroupLabel>
              <SidebarMenuSkeleton />
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenuSubItem>
                <SidebarMenuSkeleton />
              </SidebarMenuSubItem>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </>
    )
  }

  if (error) {
    return <div>Error loading pools: {error.message}</div>
  }

  if (!leagues || leagues.length === 0) {
    return <div></div>
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedLeagues).map(([sport, sportLeagues], index, array) => (
        <div key={sport}>
          <Collapsible open={openSports.includes(sport)} onOpenChange={() => toggleSport(sport)}>
            <CollapsibleTrigger className="w-full">
              <SidebarGroup>
                <SidebarGroupLabel className="flex items-center text-sm font-semibold">
                  <div className="flex items-center flex-1">
                    {getSportIcon(sport)}
                    {sport.toUpperCase()}
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${
                      openSports.includes(sport) ? "transform rotate-180" : ""
                    }`}
                  />
                </SidebarGroupLabel>
              </SidebarGroup>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                {sportLeagues.map((league) => (
                  <SidebarMenuSubItem key={league.id}>
                    <SidebarMenuSubButton
                      asChild
                      isActive={pathname.startsWith(`/dashboard/pools/${getContestPath(league.contests.name)}/${league.id}`)}
                      className="hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                        <Link href={`/dashboard/pools/${getContestPath(league.contests.name)}/${league.id}`} className="flex items-center">

                        <div className="w-2 h-2 rounded-full mr-2 bg-[#11274F] dark:bg-slate-300" ></div>
                        {league.name}
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
          {index < array.length - 1 && <div className="mt-4 mb-2 border-t border-gray-200 dark:border-gray-700" />}
        </div>
      ))}
    </div>
  )
}


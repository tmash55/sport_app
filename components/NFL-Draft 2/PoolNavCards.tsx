"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Trophy, Settings, PenLine, BarChart3, LineChart } from "lucide-react"
import { Card } from "@/components/ui/card"

interface NavItem {
  name: string
  href: string
  icon: React.ElementType
}

interface PoolNavCardsProps {
  poolId: string
  isCommissioner: boolean
}

export function PoolNavCards({ poolId, isCommissioner }: PoolNavCardsProps) {
  const pathname = usePathname()

  const navItems: NavItem[] = [
    {
      name: "Make Picks",
      href: `/dashboard/pools/nfl-draft/${poolId}/my-entries`,
      icon: PenLine,
    },
    {
      name: "Leaderboard",
      href: `/dashboard/pools/nfl-draft/${poolId}/standings`,
      icon: Trophy,
    },
    {
      name: "Analysis",
      href: `/dashboard/pools/nfl-draft/${poolId}/analysis`,
      icon: BarChart3,
    },
  ]

  if (isCommissioner) {
    navItems.push({
      name: "Commish HQ",
      href: `/dashboard/pools/nfl-draft/${poolId}/commish`,
      icon: Settings,
    })
  }

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-3 min-w-max">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link key={item.href} href={item.href}>
              <Card
                className={cn(
                  "relative group px-4 py-3 hover:shadow-md transition-all duration-200",
                  isActive && "border-primary bg-primary/5",
                )}
              >
                <div className="flex items-center gap-2">
                  <Icon
                    className={cn(
                      "h-4 w-4 transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary",
                    )}
                  />
                  <span
                    className={cn(
                      "text-sm font-medium whitespace-nowrap",
                      isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary",
                    )}
                  >
                    {item.name}
                  </span>
                </div>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}


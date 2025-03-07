"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbLink,
} from "@/components/ui/breadcrumb"
import { createClient } from "@/libs/supabase/client"
import Link from "next/link"

// Static route mapping for known paths
const routeMap: { [key: string]: string } = {
  "/dashboard": "Dashboard",
  "/dashboard/pools": "Pools",
  "/dashboard/join-pool": "Join Pools",
  "/dashboard/bracket": "Tournament Bracket",
  "/dashboard/scores": "Tournament Scores",
  "/dashboard/leaderboard": "Tournament Leaderboard",
  "/dashboard/my-pools": "My Pools",
}

export function DynamicBreadcrumb() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [leagueNames, setLeagueNames] = useState<{ [key: string]: string }>({})
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const fetchLeagueName = async () => {
      const pathSegments = pathname.split("/").filter(Boolean)

      // Ensure we are in `/dashboard/pools/[contest-name]/[league-id]`
      if (pathSegments[1] === "pools" && pathSegments[3]) {
        const leagueId = pathSegments[3]

        if (!leagueNames[leagueId]) {
          const { data, error } = await supabase
            .from("leagues")
            .select("name")
            .eq("id", leagueId)
            .single()

          if (data && !error) {
            setLeagueNames((prev) => ({ ...prev, [leagueId]: data.name }))
          }
        }
      }
    }

    fetchLeagueName()
  }, [pathname, leagueNames, supabase])

  if (!mounted) {
    return null
  }

  const pathSegments = pathname.split("/").filter(Boolean)

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* Dashboard Link */}
        <BreadcrumbItem>
          <Link href="/dashboard/my-pools" passHref legacyBehavior>
            <BreadcrumbLink className="text-muted-foreground hover:text-foreground transition-colors text-sm">
              Dashboard
            </BreadcrumbLink>
          </Link>
          <BreadcrumbSeparator />
        </BreadcrumbItem>

        {/* Pools Link */}
        {pathSegments.includes("pools") && (
          <BreadcrumbItem>
            <Link href="/dashboard/pools" passHref legacyBehavior>
              <BreadcrumbLink className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                Pools
              </BreadcrumbLink>
            </Link>
            <BreadcrumbSeparator />
          </BreadcrumbItem>
        )}

        {/* Contest Type (e.g., "NFL Draft") */}
        {pathSegments[2] && (
          <BreadcrumbItem>
            <BreadcrumbPage className="text-muted-foreground">
              {pathSegments[2]
                .replace(/-/g, " ") // Convert hyphens to spaces
                .replace(/\b\w/g, (char) => char.toUpperCase())} {/* Capitalize each word */}
            </BreadcrumbPage>
            <BreadcrumbSeparator />
          </BreadcrumbItem>
        )}

        {/* League Name (Replaces League ID) */}
        {pathSegments[3] && leagueNames[pathSegments[3]] && (
          <BreadcrumbItem>
            <BreadcrumbPage>{leagueNames[pathSegments[3]]}</BreadcrumbPage>
          </BreadcrumbItem>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

"use client"

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbLink,
} from "@/components/ui/breadcrumb"
import { createClient } from "@/libs/supabase/client"
import Link from 'next/link'

const routeMap: { [key: string]: string } = {
  '/dashboard': 'Dashboard',
  '/dashboard/leagues/create': 'Create League',
  '/dashboard/join-pool': 'Join Pools',
  '/dashboard/bracket': 'Tournament Bracket',
  '/dashboard/scores': 'Tournament Scores',
  '/dashboard/leaderboard': 'Tournament Leaderboard',
  "/dashboard/my-pools": "My Pools"
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
      const pathSegments = pathname.split('/').filter(Boolean)
      const leagueIndex = pathSegments.indexOf('leagues')
      if (leagueIndex !== -1 && pathSegments[leagueIndex + 1]) {
        const leagueId = pathSegments[leagueIndex + 1]
        
        if (!leagueNames[leagueId]) {
          const { data, error } = await supabase
            .from('leagues')
            .select('name')
            .eq('id', leagueId)
            .single()

          if (data && !error) {
            setLeagueNames(prev => ({ ...prev, [leagueId]: data.name }))
          }
        }
      }
    }

    fetchLeagueName()
  }, [pathname, leagueNames, supabase])

  if (!mounted) {
    return null
  }

  const pathSegments = pathname.split('/').filter(Boolean)

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {pathSegments.map((segment, index) => {
          const path = `/${pathSegments.slice(0, index + 1).join('/')}`
          const isLast = index === pathSegments.length - 1
          let displayName = routeMap[path] || segment.charAt(0).toUpperCase() + segment.slice(1)

          // If this segment is a league ID and we have a league name, use it
          if (pathSegments[index - 1] === 'leagues' && leagueNames[segment]) {
            displayName = leagueNames[segment]
          }
          if (path === "/dashboard") {
            return (
              <BreadcrumbItem key={path}>
                <Link href="/dashboard/my-pools" passHref legacyBehavior>
                  <BreadcrumbLink className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    {displayName}
                  </BreadcrumbLink>
                </Link>
                <BreadcrumbSeparator />
              </BreadcrumbItem>
            )
          }

          return (
            <BreadcrumbItem key={path}>
              {!isLast ? (
                <>
                  <BreadcrumbLink href={path}>
                    {displayName}
                  </BreadcrumbLink>
                  <BreadcrumbSeparator />
                </>
              ) : (
                <BreadcrumbPage>
                  {displayName}
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}


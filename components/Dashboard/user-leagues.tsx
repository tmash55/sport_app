'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/libs/supabase/client'
import { SidebarMenuSubItem, SidebarMenuSubButton, SidebarMenuSkeleton, SidebarGroup, SidebarGroupLabel, SidebarGroupContent } from "@/components/ui/sidebar"
import { FaBasketballBall, FaGolfBall } from 'react-icons/fa'
import { IoMdFootball } from 'react-icons/io'
import { MdSportsSoccer } from 'react-icons/md'

interface League {
  id: string
  name: string
  sport: string
}

interface GroupedLeagues {
  [key: string]: League[]
}

export function UserLeagues() {
  const [groupedLeagues, setGroupedLeagues] = useState<GroupedLeagues>({})
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const pathname = usePathname()
  const router = useRouter()

  const fetchUserLeagues = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data, error } = await supabase
          .from('league_members')
          .select(`
            league_id,
            leagues:league_id(
              id,
              name,
              contests(
                sport
              )
            )
          `)
          .eq('user_id', user.id)

        if (error) {
          console.error('Error fetching user leagues:', error)
        } else {
          const leagues = data.map((item: any) => ({
            id: item.leagues.id,
            name: item.leagues.name,
            sport: item.leagues.contests.sport
          }))
          
          const grouped = leagues.reduce((acc: GroupedLeagues, league: League) => {
            if (!acc[league.sport]) {
              acc[league.sport] = []
            }
            acc[league.sport].push(league)
            return acc
          }, {})
          
          setGroupedLeagues(grouped)
        }
      }
    } catch (error) {
      console.error('Error fetching user:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLeagueDeleted = (deletedLeagueId: string) => {
    setGroupedLeagues(prevGrouped => {
      const newGrouped = { ...prevGrouped }
      Object.keys(newGrouped).forEach(sport => {
        newGrouped[sport] = newGrouped[sport].filter(league => league.id !== deletedLeagueId)
        if (newGrouped[sport].length === 0) {
          delete newGrouped[sport]
        }
      })
      return newGrouped
    })
    if (pathname.startsWith(`/dashboard/leagues/${deletedLeagueId}`)) {
      router.push('/dashboard')
    }
  }

  useEffect(() => {
    fetchUserLeagues()

    window.addEventListener('leagueCreated', fetchUserLeagues)
    window.addEventListener('leagueDeleted', (e: CustomEvent) => handleLeagueDeleted(e.detail.leagueId))

    const setupSubscription = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const leagueSubscription = supabase
            .channel('league_changes')
            .on('postgres_changes', {
              event: '*',
              schema: 'public',
              table: 'leagues',
            }, (payload) => {
              if (payload.eventType === 'DELETE') {
                handleLeagueDeleted(payload.old.id)
              } else if (payload.eventType === 'UPDATE') {
                fetchUserLeagues() // Refetch all leagues to ensure correct grouping
              }
            })
            .on('postgres_changes', {
              event: '*',
              schema: 'public',
              table: 'league_members',
              filter: `user_id=eq.${user.id}`,
            }, () => {
              fetchUserLeagues()
            })
            .subscribe()

          return () => {
            supabase.removeChannel(leagueSubscription)
          }
        }
      } catch (error) {
        console.error('Error setting up subscription:', error)
      }
    }

    const cleanup = setupSubscription()

    return () => {
      window.removeEventListener('leagueCreated', fetchUserLeagues)
      window.removeEventListener('leagueDeleted', (e: CustomEvent) => handleLeagueDeleted(e.detail.leagueId))
      if (cleanup) cleanup.then(unsubscribe => unsubscribe())
    }
  }, [supabase, pathname, router])

  const getSportIcon = (sport: string) => {
    switch (sport.toLowerCase()) {
      case 'basketball':
        return <FaBasketballBall className="w-4 h-4 mr-2" />
      case 'golf':
        return <FaGolfBall className="w-4 h-4 mr-2" />
      case 'football':
        return <IoMdFootball className="w-4 h-4 mr-2" />
      case 'soccer':
        return <MdSportsSoccer className="w-4 h-4 mr-2" />
      default:
        return null
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

  return (
    <>
      {Object.entries(groupedLeagues).map(([sport, leagues]) => (
        <SidebarGroup key={sport}>
          <SidebarGroupLabel className="flex items-center">
            {getSportIcon(sport)}
            {sport.charAt(0).toUpperCase() + sport.slice(1)}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {leagues.map((league) => (
              <SidebarMenuSubItem key={league.id}>
                <SidebarMenuSubButton
                  asChild
                  isActive={pathname.startsWith(`/dashboard/leagues/${league.id}`)}
                >
                  <Link href={`/dashboard/leagues/${league.id}`}>{league.name}</Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  )
}


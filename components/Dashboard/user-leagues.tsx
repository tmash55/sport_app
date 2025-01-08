'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/libs/supabase/client'
import { SidebarMenuSubItem, SidebarMenuSubButton, SidebarMenuSkeleton } from "@/components/ui/sidebar"

export function UserLeagues() {
  const [leagues, setLeagues] = useState<{ id: string; name: string }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const pathname = usePathname()

const fetchUserLeagues = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data, error } = await supabase
        .from('league_members')
        .select('league_id, leagues(id, name)')
        .eq('user_id', user.id)

      if (error) {
        console.error('Error fetching user leagues:', error)
      } else {
        setLeagues(data.map((item: any) => ({
          id: item.leagues.id,
          name: item.leagues.name
        })))
      }
    }
  } catch (error) {
    console.error('Error fetching user:', error)
  } finally {
    setIsLoading(false)
  }
}

  useEffect(() => {
    fetchUserLeagues()

    window.addEventListener('leagueCreated', fetchUserLeagues)

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
                setLeagues(prevLeagues => prevLeagues.filter(league => league.id !== payload.old.id))
              } else if (payload.eventType === 'UPDATE') {
                setLeagues(prevLeagues => prevLeagues.map(league => 
                  league.id === payload.new.id ? { ...league, name: payload.new.name } : league
                ))
              }
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
      if (cleanup) cleanup.then(unsubscribe => unsubscribe())
    }
  }, [supabase])

  if (isLoading) {
    return (
      <>
        {[...Array(3)].map((_, index) => (
          <SidebarMenuSubItem key={index}>
            <SidebarMenuSkeleton />
          </SidebarMenuSubItem>
        ))}
      </>
    )
  }

  return (
    <>
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
    </>
  )
}


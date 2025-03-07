"use client"

import type React from "react"
import { createContext, useContext } from "react"
import useSWR from "swr"
import { createClient } from "@/libs/supabase/client"
import { useUser } from "./UserProvider"

const LeaguesContext = createContext<{
  leagues: any[]
  userId: string | null
  userInfo: any
  error: any
} | null>(null)
const supabase = createClient()
const fetcher = async (userId: string) => {
  const [{ data: leaguesData, error: leaguesError }, { data: userData, error: userError }] = await Promise.all([
    supabase
      .from("leagues")
      .select(`
        *,
        contests:contest_id (
          id,
          name,
          contest_type,
          sport,
          status
        ),
        league_members!inner (
          user_id,
          role
        ),
        all_members:league_members (
          user_id,
          role
        ),
        member_count:league_members(count),
        drafts (
          id,
          status,
          start_time,
          draft_pick_timer
        ),
        roster_entries(entry_name)
      `)
      .eq("league_members.user_id", userId)
      .order("created_at", { ascending: false }),
    supabase.from("users").select("display_name, email, avatar_url").eq("id", userId).single(),
  ])

  if (leaguesError) {
    throw leaguesError
  }

  if (userError) {
    console.error("Error fetching user data:", userError)
  }

  const processedLeagues = leaguesData.map((league) => ({
    ...league,
    draft_status: league.drafts && league.drafts ? league.drafts.status : "not_scheduled",
    start_time: league.drafts && league.drafts ? league.drafts.start_time : null,
    entryCount: league.roster_entries?.length || 0,
    
  }))
 


  return {
    leagues: processedLeagues,
    userId,
    userInfo: userData || {
      display_name: "User",
      email: "",
      avatar_url: null,
    },
  }
}

export function LeaguesProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useUser()

  const { data, error } = useSWR(user && !isLoading ? user.id : null, fetcher, {
    
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 10 * 60 * 1000, // Refresh every 5 minutes
    keepPreviousData: true,
  })

  return (
    <LeaguesContext.Provider value={data ? { ...data, error } : { leagues: [], userId: null, userInfo: null, error }}>
      {children}
    </LeaguesContext.Provider>
  )
}

export function useLeagues() {
  const context = useContext(LeaguesContext)

  if (!context) {
    throw new Error("useLeagues must be used within a LeaguesProvider")
  }

  return context
}


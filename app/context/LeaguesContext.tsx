"use client"

import type React from "react"
import { createContext, useContext } from "react"
import useSWR from "swr"
import { createClient } from "@/libs/supabase/client"

const LeaguesContext = createContext(null)

const fetcher = async () => {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
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
          )
        `)
        .eq("league_members.user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase.from("users").select("display_name, email, avatar_url").eq("id", user.id).single(),
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
    }))

    return {
      leagues: processedLeagues,
      userId: user.id,
      userInfo: userData || {
        display_name: user.email?.split("@")[0] || "User",
        email: user.email,
        avatar_url: null,
      },
    }
  }

  return { leagues: [], userId: null, userInfo: null }
}

export function LeaguesProvider({ children }: { children: React.ReactNode }) {
  const { data, error } = useSWR("leagues-and-user", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  })

  return <LeaguesContext.Provider value={{ ...data, error }}>{children}</LeaguesContext.Provider>
}

export function useLeagues() {
  const context = useContext(LeaguesContext)

  if (!context) {
    throw new Error("useLeagues must be used within a LeaguesProvider")
  }

  return context
}


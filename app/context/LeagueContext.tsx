"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { createClient } from "@/libs/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "./UserProvider"

interface LeagueContextType {
  leagueData: any
  matchups: any[]
  isLoading: boolean
  error: Error | null
  refreshLeagueData: () => Promise<void>
  updateLeagueData: (updatedData: Partial<any>) => void
  updateLeagueSettings: (updatedSettings: Partial<any>) => void
  updateLeagueName: (newName: string) => Promise<void>
}

const LeagueContext = createContext<LeagueContextType | null>(null)

export function useLeague() {
  const context = useContext(LeagueContext)
  if (context === null) {
    throw new Error("useLeague must be used within a LeagueProvider")
  }
  return context
}

export function LeagueProvider({
  children,
  leagueId,
}: {
  children: React.ReactNode
  leagueId: string
}) {
  const [leagueData, setLeagueData] = useState<any>(null)
  const [matchups, setMatchups] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()
  const { toast } = useToast()
  const { user } = useUser()

  const fetchLeagueData = useCallback(async () => {
    if (!user) return
    try {
      setIsLoading(true)
      const userId = user.id

      const { data, error } = await supabase
        .from("leagues")
        .select(`
          *,
          contests:contest_id (
            id,
            name,
            contest_type,
            sport
          ),
          league_members (
            id,
            user_id,
            role,
            draft_position,
            team_name,
            users:user_id (
              id,
              display_name
            )
          ),
          league_settings!inner (
            max_teams,
            round_1_score,
            round_2_score,
            round_3_score,
            round_4_score,
            round_5_score,
            round_6_score,
            upset_multiplier
          ),
          commissioner:commissioner_id (
            id,
            email,
            first_name,
            last_name,
            display_name
          ),
          drafts (
            *
          ),
          draft_picks (
            id,
            league_member_id,
            pick_number,
            league_teams (
              id,
              name,
              global_teams (
                id,
                seed,
                logo_filename,
                round_1_win,
                round_2_win,
                round_3_win,
                round_4_win,
                round_5_win,
                round_6_win,
                round_1_upset,
                round_2_upset,
                round_3_upset,
                round_4_upset,
                round_5_upset,
                round_6_upset,
                is_eliminated
              )
            )
          )
        `)
        .eq("id", leagueId)
        .single()

      if (error) throw error

      const { data: matchupsData, error: matchupsError } = await supabase
        .from("matchups")
        .select(`
          id,
          round,
          group,
          region,
          home_score,
          away_score,
          game_status,
          home_team:global_teams!home_team_id(*),
          away_team:global_teams!away_team_id(*),
          winning_team:global_teams!winning_team_id(*)
        `)
        .order("round", { ascending: true })
        .order("group", { ascending: true })

      if (matchupsError) throw matchupsError

      const draft_status = data.drafts.status

      setLeagueData({ ...data, user_id: userId, draft_status })
      setMatchups(matchupsData)
      setError(null)
    } catch (err) {
      setError(err as Error)
      toast({
        title: "Error",
        description: "Failed to load league data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [leagueId, supabase, toast, user])

  useEffect(() => {
    if (user) {
      // Only fetch data if there's a user
      fetchLeagueData()
    }

    const leagueChannel = supabase
      .channel("league_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "leagues", filter: `id=eq.${leagueId}` },
        fetchLeagueData,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "league_settings", filter: `league_id=eq.${leagueId}` },
        fetchLeagueData,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "league_members", filter: `league_id=eq.${leagueId}` },
        fetchLeagueData,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "draft_picks", filter: `league_id=eq.${leagueId}` },
        fetchLeagueData,
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "matchups" }, fetchLeagueData)
      .subscribe()

    return () => {
      supabase.removeChannel(leagueChannel)
    }
  }, [user, leagueId, supabase, fetchLeagueData])

  const refreshLeagueData = useCallback(async () => {
    await fetchLeagueData()
  }, [fetchLeagueData])

  const updateLeagueData = useCallback((updatedData: Partial<any>) => {
    setLeagueData((prevData: any) => ({ ...prevData, ...updatedData }))
  }, [])

  const updateLeagueSettings = useCallback((updatedSettings: Partial<any>) => {
    setLeagueData((prevData: any) => ({
      ...prevData,
      league_settings: [{ ...prevData.league_settings[0], ...updatedSettings }],
    }))
  }, [])

  const updateLeagueName = useCallback(
    async (newName: string) => {
      try {
        const { error } = await supabase.from("leagues").update({ name: newName }).eq("id", leagueId)

        if (error) throw error

        setLeagueData((prevData: any) => ({ ...prevData, name: newName }))
      } catch (error) {
        console.error("Error updating league name:", error)
        throw error
      }
    },
    [leagueId, supabase],
  )

  return (
    <LeagueContext.Provider
      value={{
        leagueData,
        matchups,
        isLoading,
        error,
        refreshLeagueData,
        updateLeagueData,
        updateLeagueSettings,
        updateLeagueName,
      }}
    >
      {children}
    </LeagueContext.Provider>
  )
}


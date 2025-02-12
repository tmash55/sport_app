"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/libs/supabase/client"

export function useMatchups(leagueId: string) {
  const [matchups, setMatchups] = useState<any[]>([])
  const [matchupsLoading, setMatchupsLoading] = useState(true)
  const [matchupsError, setMatchupsError] = useState<Error | null>(null)
  const supabase = createClient()

  const fetchMatchups = useCallback(async () => {
    setMatchupsLoading(true)
    setMatchupsError(null)

    const { data, error } = await supabase.rpc("get_matchups", { p_league_id: leagueId })

    if (error) {
      console.error("Error fetching matchups:", error)
      setMatchupsError(new Error(error.message))
    } else {
      setMatchups(data)
    }

    setMatchupsLoading(false)
  }, [leagueId, supabase])

  useEffect(() => {
    fetchMatchups()
  }, [fetchMatchups])

  return { matchups, matchupsLoading, matchupsError, fetchMatchups }
}


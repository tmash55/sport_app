"use client"

import type React from "react"
import { createContext, useContext } from "react"
import { useLeagueData } from "@/hooks/use-league-data"

const LeagueContext = createContext(null)

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
  const { leagueData, isLoading, error, mutate } = useLeagueData(leagueId)

  return <LeagueContext.Provider value={{ leagueData, isLoading, error, mutate }}>{children}</LeagueContext.Provider>
}


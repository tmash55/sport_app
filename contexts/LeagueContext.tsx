"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { createClient } from "@/libs/supabase/client"

interface LeagueContextType {
  leagueNames: { [key: string]: string }
  updateLeagueName: (leagueId: string, name: string) => void
}

const LeagueContext = createContext<LeagueContextType | undefined>(undefined)

export const useLeague = () => {
  const context = useContext(LeagueContext)
  if (context === undefined) {
    throw new Error('useLeague must be used within a LeagueProvider')
  }
  return context
}

export const LeagueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leagueNames, setLeagueNames] = useState<{ [key: string]: string }>({})
  const supabase = createClient()

  const updateLeagueName = (leagueId: string, name: string) => {
    setLeagueNames(prev => ({ ...prev, [leagueId]: name }))
  }

  useEffect(() => {
    const channel = supabase
      .channel('league_name_changes')
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'leagues'
        }, 
        (payload) => {
          if (payload.new && payload.new.id && payload.new.name) {
            updateLeagueName(payload.new.id, payload.new.name)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return (
    <LeagueContext.Provider value={{ leagueNames, updateLeagueName }}>
      {children}
    </LeagueContext.Provider>
  )
}


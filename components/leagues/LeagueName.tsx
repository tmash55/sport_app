"use client"

import { useLeague } from "@/contexts/LeagueContext"

interface LeagueNameProps {
  leagueId: string
  initialName: string
}

export function LeagueName({ leagueId, initialName }: LeagueNameProps) {
  const { leagueNames } = useLeague()
  
  return <>{leagueNames[leagueId] || initialName}</>
}


'use client'

import { use } from 'react'
import { getLeagueName } from '@/app/actions/league-actions'

export function LeagueNameDisplay({ leagueId }: { leagueId: string }) {
  const leagueName = use(getLeagueName(leagueId))
  return <span>{leagueName}</span>
}


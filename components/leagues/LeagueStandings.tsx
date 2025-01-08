"use client"
import React, { useState, useEffect } from 'react'
import { createClient } from "@/libs/supabase/client"

interface LeagueMember {
  id: string
  user_id: string
  league_id: string
  team_name: string
  total_score: number
  round_1_score: number
  round_2_score: number
  round_3_score: number
  round_4_score: number
  round_5_score: number
  round_6_score: number
  teams_remaining: number
}

interface DraftPick {
  id: string
  user_id: string
  team_id: string
  league_teams: {
    global_teams: {
      is_eliminated: boolean
    }
  }
}

interface LeagueStandingsProps {
  leagueId: string
}

export function LeagueStandings({ leagueId }: LeagueStandingsProps) {
  const [leagueMembers, setLeagueMembers] = useState<LeagueMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        console.log('Fetching data for league ID:', leagueId)
        
        // Fetch league members
        const { data: membersData, error: membersError } = await supabase
          .from('league_members')
          .select('*')
          .eq('league_id', leagueId)

        if (membersError) throw membersError

        // Fetch draft picks with team information for this league
        const { data: draftPicksData, error: draftPicksError } = await supabase
          .from('draft_picks')
          .select(`
            id,
            user_id,
            team_id,
            league_teams (
              id,
              global_teams (
                id,
                is_eliminated
              )
            )
          `)
          .eq('league_id', leagueId)

        if (draftPicksError) throw draftPicksError

        console.log('Raw members data:', membersData)
        console.log('Raw draft picks data:', draftPicksData)

        if (!membersData || membersData.length === 0) {
          console.warn('No league members found')
          setLeagueMembers([])
          return
        }

        // Process the data to calculate teams remaining
        const processedData = membersData.map(member => {
          const memberDraftPicks = draftPicksData.filter(pick => pick.user_id === member.user_id)
          const teamsRemaining = memberDraftPicks.filter(
            pick => pick.league_teams && 
                    pick.league_teams.global_teams && 
                    !pick.league_teams.global_teams.is_eliminated
          ).length

          return {
            ...member,
            teams_remaining: teamsRemaining
          }
        })

        console.log('Processed data:', processedData)
        setLeagueMembers(processedData)
      } catch (e) {
        console.error('Error in fetchData:', e)
        setError(e instanceof Error ? e.message : 'An unknown error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [leagueId, supabase])

  if (isLoading) return <div className="text-center py-4">Loading standings...</div>
  if (error) return <div className="text-center py-4 text-red-500">Error loading standings: {error}</div>

  // Sort league members by total score in descending order
  const sortedLeagueMembers = [...leagueMembers].sort((a, b) => b.total_score - a.total_score)

  return (
    <div className="overflow-x-auto">
      <h2 className="text-2xl font-bold mb-4">League Standings</h2>
      {sortedLeagueMembers.length === 0 ? (
        <p className="text-center py-4">No standings data available.</p>
      ) : (
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">Rank</th>
              <th scope="col" className="px-6 py-3">Team Name</th>
              <th scope="col" className="px-6 py-3">Teams Remaining</th>
              <th scope="col" className="px-6 py-3">Round 1</th>
              <th scope="col" className="px-6 py-3">Round 2</th>
              <th scope="col" className="px-6 py-3">Round 3</th>
              <th scope="col" className="px-6 py-3">Round 4</th>
              <th scope="col" className="px-6 py-3">Round 5</th>
              <th scope="col" className="px-6 py-3">Round 6</th>
              <th scope="col" className="px-6 py-3">Total</th>
            </tr>
          </thead>
          <tbody>
            {sortedLeagueMembers.map((member, index) => (
              <tr key={member.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  {index + 1}
                </td>
                <td className="px-6 py-4">{member.team_name}</td>
                <td className="px-6 py-4">{member.teams_remaining}</td>
                <td className="px-6 py-4">-</td>
                <td className="px-6 py-4">-</td>
                <td className="px-6 py-4">-</td>
                <td className="px-6 py-4">-</td>
                <td className="px-6 py-4">-</td>
                <td className="px-6 py-4">-</td>
                <td className="px-6 py-4 font-bold">0</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}


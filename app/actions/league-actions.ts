'use server'

import { createClient } from "@/libs/supabase/server"
import { revalidatePath } from "next/cache"

export async function createLeague(name: string) {
  const supabase = createClient()

  try {
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { error: 'User not authenticated' }
    }

    // Fetch the user's display_name
    const { data: userData, error: userDataError } = await supabase
      .from('users')
      .select('display_name')
      .eq('id', user.id)
      .single()

    if (userDataError) {
      return { error: 'Failed to fetch user data' }
    }

    const displayName = userData?.display_name || user.email?.split('@')[0] || 'Unknown'

    // Insert the new league
    const { data, error } = await supabase
      .from("leagues")
      .insert({
        name: name,
        commissioner_id: user.id,
      })
      .select()
      .single()

    if (error) {
      return { error: error.message }
    }

    if (!data) {
      return { error: 'No data returned from league creation' }
    }

    // Add commissioner as a league member with team_name set to display_name
    const { error: memberError } = await supabase
      .from("league_members")
      .insert({ 
        league_id: data.id, 
        user_id: user.id,
        team_name: displayName
      })

    if (memberError) {
      return { error: memberError.message }
    }

    revalidatePath('/dashboard/leagues')
    return { leagueId: data.id }
  } catch (error) {
    console.error("Error creating league:", error)
    return { error: error instanceof Error ? error.message : "An unexpected error occurred" }
  }
}

export async function getLeagueName(leagueId: string) {
  const supabase = createClient()
  const { data: league } = await supabase
    .from('leagues')
    .select('name')
    .eq('id', leagueId)
    .single()

  return league?.name || leagueId
}


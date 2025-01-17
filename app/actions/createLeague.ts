'use server'

import { createClient } from '@/libs/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createLeague(name: string, contestId: string, maxTeams: number = 12) {
  const supabase = createClient()
  console.log('Creating league with:', { name, contestId, maxTeams })

  try {
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error('User authentication error:', userError)
      return { error: "User not authenticated" }
    }
    console.log('Authenticated user:', user.id)

    // Fetch the user's display_name
    const { data: userData, error: userDataError } = await supabase
      .from("users")
      .select("display_name")
      .eq("id", user.id)
      .single()

    if (userDataError) {
      console.error('Error fetching user data:', userDataError)
      return { error: "Failed to fetch user data" }
    }
    console.log('User display name:', userData?.display_name)

    const displayName = userData?.display_name || user.email?.split("@")[0] || "Unknown"

    // Fetch contest details
    console.log('Fetching contest details for ID:', contestId)
    const { data: contestData, error: contestError } = await supabase
      .from("contests")
      .select("name, contest_type, sport")
      .eq("id", contestId)
      .single()

    if (contestError || !contestData) {
      console.error('Error fetching contest data:', contestError)
      return { error: "Failed to fetch contest data" }
    }
    console.log('Contest data:', contestData)

    // Insert the new league
    const { data, error } = await supabase
      .from("leagues")
      .insert({
        name: name,
        contest_id: contestId,
        commissioner_id: user.id,
        max_teams: maxTeams,
        settings: {
          draft_type: 'snake',
          scoring_system: 'standard',
        },
        status: 'draft'
      })
      .select()
      .single()

    if (error) {
      console.error('Error inserting new league:', error)
      return { error: error.message }
    }

    if (!data) {
      console.error('No data returned from league creation')
      return { error: "No data returned from league creation" }
    }
    console.log('League created:', data)

    // Add commissioner as a league member with team_name set to display_name and role set to 'commissioner'
    const { error: memberError } = await supabase
      .from("league_members")
      .insert({
        league_id: data.id,
        user_id: user.id,
        team_name: displayName,
        role: 'commissioner'
      })

    if (memberError) {
      console.error('Error adding commissioner as league member:', memberError)
      return { error: memberError.message }
    }
    console.log('Commissioner added as league member')

    // Create default league_members records for remaining spots
    const defaultMembers = Array.from({ length: maxTeams - 1 }, (_, index) => ({
      league_id: data.id,
      user_id: null,
      team_name: `Team ${index + 2}`,
      role: 'member',
      joined_at: null,
      draft_position: null,
      avatar_url: null,
    }))

    const { error: defaultMembersError } = await supabase
      .from("league_members")
      .insert(defaultMembers)

    if (defaultMembersError) {
      console.error('Error creating default league members:', defaultMembersError)
      return { error: defaultMembersError.message }
    }
    console.log('Default league members created')

    revalidatePath("/dashboard/leagues")
    return { leagueId: data.id }
  } catch (error) {
    console.error("Unexpected error creating league:", error)
    return {
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}


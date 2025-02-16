"use server"

import { createClient } from "@/libs/supabase/server"



const MAX_TEAM_NAME_LENGTH = 25 // Make sure this matches the client-side constant

export async function updateTeamName(leagueMemberId: string, newTeamName: string) {
  const supabase = createClient()

  // Trim the team name and validate
  const trimmedName = newTeamName.trim()
  if (trimmedName.length === 0) {
    return { success: false, error: "Team name cannot be empty." }
  }

  if (trimmedName.length > MAX_TEAM_NAME_LENGTH) {
    return { success: false, error: `Team name must be ${MAX_TEAM_NAME_LENGTH} characters or less.` }
  }

  const { data, error } = await supabase
    .from("league_members")
    .update({ team_name: trimmedName })
    .eq("id", leagueMemberId)
    .select()

  if (error) {
    console.error("Error updating team name:", error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}


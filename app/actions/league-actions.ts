'use server'

import { createClient } from "@/libs/supabase/server"
import { revalidatePath } from "next/cache"




export async function getLeagueName(leagueId: string) {
  const supabase = createClient()
  const { data: league } = await supabase
    .from('leagues')
    .select('name')
    .eq('id', leagueId)
    .single()

  return league?.name || leagueId
}

export async function updateLeagueMaxTeams(leagueId: string, newMaxTeams: number) {
  const supabase = createClient();

  try {
    // Call the RPC function to handle the logic in the database
    const { data, error: rpcError } = await supabase.rpc("update_max_teams_transaction", {
      league_id: leagueId,
      max_teams: newMaxTeams,
    });

    if (rpcError) {
      console.error("RPC Error:", rpcError.message);
      return { error: rpcError.message };
    }

    return { success: true, result: data };
  } catch (error) {
    console.error("Error updating league max_teams via RPC:", error);
    return {
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}





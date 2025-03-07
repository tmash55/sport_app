"use server";

import { createClient } from "@/libs/supabase/server";
import { revalidatePath } from "next/cache";

interface LeagueMember {
  league_id: string;
  user_id: string | null;
  team_name: string;
  role: "commissioner" | "member";
  joined_at: Date | null;
  avatar_url: string | null;
}

export async function createNFLDraftLeague(name: string, contestId: string) {
    const supabase = createClient();
    console.log("Creating NFL Draft league with:", { name, contestId });
  
    try {
      // ✅ Get the current authenticated user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error("User authentication error:", userError);
        return { error: "User not authenticated" };
      }
      console.log("Authenticated user:", user.id);
  
      // ✅ Fetch the user's display name
      const { data: userData, error: userDataError } = await supabase
        .from("users")
        .select("display_name")
        .eq("id", user.id)
        .single();
  
      if (userDataError) {
        console.error("Error fetching user data:", userDataError);
        return { error: "Failed to fetch user data" };
      }
      console.log("User display name:", userData?.display_name);
  
      const displayName = userData?.display_name || user.email?.split("@")[0] || "Unknown";
  
      // ✅ Fetch contest details, including max/min players
      console.log("Fetching contest details for ID:", contestId);
      const { data: contestData, error: contestError } = await supabase
        .from("contests")
        .select("name, contest_type, sport, max_players, min_players")
        .eq("id", contestId)
        .single();
  
      if (contestError || !contestData) {
        console.error("Error fetching contest data:", contestError);
        return { error: "Failed to fetch contest data" };
      }
      console.log("Contest data:", contestData);
  
      // ✅ Ensure `max_teams` is within allowed limits
      const maxTeams = Math.max(contestData.min_players, Math.min(contestData.max_players, 500));
  
      // ✅ Insert the new league
      const { data, error } = await supabase
        .from("leagues")
        .insert({
          name,
          contest_id: contestId,
          commissioner_id: user.id,
          max_teams: maxTeams, // 🔥 Dynamically set
          settings: {
            format: "offense",
            lock_entries_at: "2025-04-25T00:00:00Z", // 🔥 Set exact date & time in UTC
            max_rounds: 7,
            dq_undrafted: false,
            max_entries_per_user: 3,
          },
          status: "active", // League is active immediately
        })
        .select()
        .single();
  
      if (error) {
        console.error("Error inserting new NFL Draft league:", error);
        return { error: error.message };
      }
  
      if (!data) {
        console.error("No data returned from league creation");
        return { error: "No data returned from league creation" };
      }
      console.log("NFL Draft league created:", data);
  
      // ✅ Add commissioner as a league member
      const { error: memberError } = await supabase.from("league_members").insert({
        league_id: data.id,
        user_id: user.id,
        team_name: displayName,
        role: "commissioner",
      });
  
      if (memberError) {
        console.error("Error adding commissioner as league member:", memberError);
        return { error: memberError.message };
      }
      console.log("Commissioner added as league member");
  
      // ✅ Refresh the dashboard after creation
      revalidatePath("/dashboard/pools/nfl-draft");
  
      return { leagueId: data.id };
    } catch (error) {
      console.error("Unexpected error creating NFL Draft league:", error);
      return {
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      };
    }
  }
  

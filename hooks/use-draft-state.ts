import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/libs/supabase/client"
import type { Draft, LeagueMember, LeagueTeam, DraftPick } from "@/types/draft"
import { useToast } from "./use-toast"



export function useDraftState(leagueId: string, ) {
  const [draft, setDraft] = useState<Draft | null>(null)
  const [leagueMembers, setLeagueMembers] = useState<LeagueMember[]>([])
  const [availableTeams, setAvailableTeams] = useState<LeagueTeam[]>([])
  const [draftPicks, setDraftPicks] = useState<DraftPick[]>([])
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCommissioner, setIsCommissioner] = useState(false)
  const [maxTeams, setMaxTeams] = useState(0)
  const [draftedTeamIds, setDraftedTeamIds] = useState<Set<string>>(new Set())
  const [leagueName, setLeagueName] = useState<string | null>(null)
  const [matchups, setMatchups] = useState<any[]>([]);
  const [matchupsLoading, setMatchupsLoading] = useState(true);
  const [matchupsError, setMatchupsError] = useState<Error | null>(null);

  const supabase = createClient()
  const { toast } = useToast()  

  

  //fetch user on mount
  useEffect(() => {
    const initializeUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error);
        return;
      }
      setCurrentUser(user?.id || null);
    };

    initializeUser();
  }, []);


  // ✅ Fetch initial draft data
  const fetchDraftData = useCallback(async () => {
    if (!currentUser) return; // Ensure we have a user before fetching draft data
    setIsLoading(true);
  
    try {
      const { data, error } = await supabase.rpc("get_draft_data", {
        p_league_id: leagueId,
      });
  
      if (error) throw error;
  
      // ✅ Set all the state variables from the single response
      setDraft(data.draft);
      setLeagueName(data.league.name);
      setIsCommissioner(data.league.commissioner_id === currentUser);
      setMaxTeams(data.settings.max_teams);
      setLeagueMembers(data.members || []);
      setAvailableTeams(data.teams || []);
      setDraftPicks(data.picks || []);
      
      setDraftedTeamIds(new Set((data.picks || []).map((pick: any) => pick.team_id)));
  
    } catch (error) {
      console.error("Error fetching draft data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [leagueId, currentUser]);
  // ✅ Fetch Matchups Data
  const fetchMatchups = async () => {
    setMatchupsLoading(true)
    setMatchupsError(null)

    const { data, error } = await supabase.rpc("get_matchups", { p_league_id: leagueId })

    if (error) {
      console.error("Error fetching matchups:", error)
      setMatchupsError(new Error(error.message))
    } else {
      setMatchups(data)
    }

    setMatchupsLoading(false)
  }

  // ✅ Ensure Matchups are fetched on mount
  useEffect(() => {
    fetchMatchups()
  }, [leagueId])
  

  // ✅ Fetch data on mount
  useEffect(() => {
    fetchDraftData()
  }, [fetchDraftData])
  console.log(draftPicks)
  
  const handleSettingsChange = useCallback(
    async (newSettings: { leagueName: string; minutesPerPick: number }) => {
      try {
        const { error: leagueError } = await supabase
          .from("leagues")
          .update({ name: newSettings.leagueName })
          .eq("id", leagueId)

        if (leagueError) throw leagueError

        const { error: draftError } = await supabase
          .from("drafts")
          .update({ draft_pick_timer: newSettings.minutesPerPick * 60 })
          .eq("id", draft?.id)

        if (draftError) throw draftError

        toast({
          title: "Settings Updated",
          description: "Draft settings have been successfully updated.",
        })
      } catch (error) {
        console.error("Error updating settings:", error)
        toast({
          title: "Error",
          description: "Failed to update settings. Please try again.",
          variant: "destructive",
        })
      }
    },
    [supabase, leagueId, draft, toast],
  )
  const getCurrentDrafter = () => {
    if (!draft) return null
    const currentPick = draft.current_pick_number
    const totalMembers = leagueMembers.length
    const roundNumber = Math.floor((currentPick - 1) / totalMembers) + 1
    const pickInRound = (currentPick - 1) % totalMembers

    const draftPosition = roundNumber % 2 === 1 ? pickInRound + 1 : totalMembers - pickInRound

    return leagueMembers.find(member => member.draft_position === draftPosition)
  }
  const isUsersTurn = () => {
    const currentDrafter = getCurrentDrafter()
    return currentDrafter?.user_id === currentUser
  }

  const handleDraftAction = async (action: "start" | "pause" | "resume") => {
    if (!draft) return

    try {
      let newStatus: Draft["status"]
      let timerExpiresAt: string | null = null

      switch (action) {
        case "start":
        case "resume":
          newStatus = "in_progress"
          // Use server-side timestamp for consistency
          const { data, error } = await supabase.rpc("update_draft_status", {
            p_draft_id: draft.id,
            p_status: newStatus,
            p_draft_pick_timer: draft.draft_pick_timer,
          })
          if (error) throw error
          timerExpiresAt = data.timer_expires_at
          break
        case "pause":
          newStatus = "paused"
          break
        default:
          return
      }

      if (action === "pause") {
        const { error } = await supabase
          .from("drafts")
          .update({
            status: newStatus,
            timer_expires_at: null,
          })
          .eq("id", draft.id)

        if (error) throw error
      }

      // The subscription will handle the state update
    } catch (error) {
      console.error(`Error ${action}ing draft:`, error)
      toast({
        title: "Error",
        description: `Failed to ${action} the draft. Please try again.`,
        variant: "destructive",
      })
    }
  }

  const handleAutoPick = async () => {
    if (!draft) return;

    const currentDrafter = getCurrentDrafter();
    if (!currentDrafter) return;

    try {
        // ✅ Check if a pick has already been made for this draft pick number
        const { data: existingPick, error: existingPickError } = await supabase
            .from("draft_picks")
            .select("id")
            .eq("draft_id", draft.id)
            .eq("pick_number", draft.current_pick_number)
            .single();

        if (existingPickError && existingPickError.code !== "PGRST116") {
            throw existingPickError;
        }

        if (existingPick) {
            console.log("✅ Pick already made for this draft number, skipping auto-pick");
            return;
        }

        // ✅ Find the best available team (lowest seed)
        const availableUndraftedTeams = availableTeams
            .filter((team) => !draftedTeamIds.has(team.id))
            .sort((a, b) => a.global_teams?.seed - b.global_teams?.seed);

        const nextAvailableTeam = availableUndraftedTeams[0];
        if (!nextAvailableTeam) {
            throw new Error("🚨 No available teams left for AutoPick!");
        }

        // ✅ If currentDrafter has a user_id, use the RPC function
        if (currentDrafter.user_id) {
            const { error } = await supabase.rpc("make_draft_pick", {
                p_draft_id: draft.id,
                p_league_id: leagueId,
                p_user_id: currentDrafter.user_id,
                p_team_id: nextAvailableTeam.id
            });

            if (error) throw error;
        } else {
            // 🚨 If there's no user_id, manually insert the pick
            const { error } = await supabase
                .from("draft_picks")
                .insert({
                    draft_id: draft.id,
                    league_id: leagueId,
                    league_member_id: currentDrafter.id, // Assign to temp league_member
                    team_id: nextAvailableTeam.id,
                    pick_number: draft.current_pick_number,
                    is_auto_pick: true
                });

            if (error) throw error;

            // ✅ Manually update the draft state since the RPC function isn't handling it
            const timerExpiresAt = new Date(Date.now() + draft.draft_pick_timer * 1000).toISOString();

            await supabase
                .from("drafts")
                .update({
                    current_pick_number: draft.current_pick_number + 1,
                    timer_expires_at: timerExpiresAt
                })
                .eq("id", draft.id);
        }

       

    } catch (error) {
        console.error("❌ Error making auto pick:", error);
        
    }
};


  const handleDraftPick = async (teamId: string) => {
    if (!draft || !isUsersTurn()) return;

    try {
        // Call the Supabase RPC function instead of manually inserting a pick
        const { error } = await supabase.rpc("make_draft_pick", {
            p_draft_id: draft.id,
            p_league_id: leagueId,
            p_user_id: currentUser,
            p_team_id: teamId
        });

        if (error) throw error;

        

        // No need to manually update local state
        // The Supabase subscription will automatically update the UI
        fetchMatchups(); // Ensure matchups are updated if relevant

    } catch (error) {
        console.error("Error making draft pick:", error);
      
    }
};  

useEffect(() => {
  if (!draft) return

  console.log("Listening for real-time draft updates...")

  const channel = supabase.channel(`draft_room_${draft.id}`)

  channel.on(
    "postgres_changes",
    { event: "INSERT", schema: "public", table: "draft_picks", filter: `draft_id=eq.${draft.id}` },
    async (payload) => {
      console.log("New draft pick detected!", payload.new)

      const { data: fullPick, error } = await supabase
        .from("draft_picks")
        .select("*, league_teams(*, global_teams(*))")
        .eq("id", payload.new.id)
        .single()

      if (error) {
        console.error("Error fetching full pick details:", error)
        return
      }

      setDraftPicks((prevPicks) => [...prevPicks, fullPick])
      setDraftedTeamIds((prevIds) => new Set(prevIds).add(fullPick.team_id))
      setAvailableTeams((prevTeams) => prevTeams.filter((team) => team.id !== fullPick.team_id))

      fetchMatchups()
    },
  )

  channel.on(
    "postgres_changes",
    { event: "UPDATE", schema: "public", table: "drafts", filter: `id=eq.${draft.id}` },
    (payload) => {
      console.log("Draft state updated!", payload.new)
      setDraft((prevDraft) => ({
        ...prevDraft!,
        ...payload.new,
      }))
    },
  )

  channel.subscribe()

  return () => {
    console.log("Unsubscribing from draft updates...")
    supabase.removeChannel(channel)
  }
}, [draft, supabase]) 
  
  
  

  

  return {
    draft,
    leagueMembers,
    availableTeams,
    draftPicks,
    currentUser,
    isLoading,
    isCommissioner,
    maxTeams,
    draftedTeamIds,
    leagueName,
    fetchDraftData,
    handleAutoPick,
    handleDraftAction,
    handleDraftPick,
    handleSettingsChange,
    isUsersTurn,
    getCurrentDrafter,
    matchups,
    matchupsLoading,
    matchupsError,
    fetchMatchups,
  }
}

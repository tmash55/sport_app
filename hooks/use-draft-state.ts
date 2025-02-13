import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/libs/supabase/client"
import type { Draft, LeagueMember, LeagueTeam, DraftPick } from "@/types/draft"
import { useToast } from "./use-toast"



export function useDraftState(leagueId: string) {
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

  // ✅ Fetch initial draft data
  const fetchDraftData = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      setCurrentUser(user?.id || null)

      const { data: draftData, error: draftError } = await supabase
        .from("drafts")
        .select("*")
        .eq("league_id", leagueId)
        .single()
      if (draftError) throw draftError
      setDraft(draftData)

      const { data: leagueData, error: leagueError } = await supabase
        .from("leagues")
        .select("commissioner_id, name")
        .eq("id", leagueId)
        .single()
      if (leagueError) throw leagueError
      setIsCommissioner(leagueData.commissioner_id === user?.id)
      setLeagueName(leagueData.name)

      const { data: settingsData, error: settingsError } = await supabase
        .from("league_settings")
        .select("max_teams")
        .eq("league_id", leagueId)
        .single()
      if (settingsError) throw settingsError
      setMaxTeams(settingsData.max_teams)

      const { data: membersData, error: membersError } = await supabase
        .from("league_members")
        .select("*, users(email, first_name, last_name)")
        .eq("league_id", leagueId)
      if (membersError) throw membersError
      setLeagueMembers(membersData)

      const { data: teamsData, error: teamsError } = await supabase
        .from("league_teams")
        .select("*, global_teams(id, seed, logo_filename, conference, wins, losses, bpi_rank, ppg, oppg, sos, quality_wins, quality_losses)")
        .eq("league_id", leagueId)
      if (teamsError) throw teamsError
      setAvailableTeams(teamsData)

      const { data: picksData, error: picksError } = await supabase
        .from("draft_picks")
        .select("*, league_teams(*, global_teams(id, seed, logo_filename)), users(email, first_name, last_name)")
        .eq("draft_id", draftData.id)
      if (picksError) throw picksError
      setDraftPicks(picksData)
      setDraftedTeamIds(new Set(picksData.map((pick) => pick.team_id)))

    } catch (error) {
      console.error("Error fetching draft data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [leagueId])
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
  

  const handleDraftAction = async (action: 'start' | 'pause' | 'resume') => {
    if (!draft) return;
  
    try {
      let newStatus: Draft['status'];
      let timerExpiresAt: string | null = null;
  
      switch (action) {
        case 'start':
        case 'resume':
          newStatus = 'in_progress';
          timerExpiresAt = new Date(Date.now() + draft.draft_pick_timer * 1000).toISOString();
          break;
        case 'pause':
          newStatus = 'paused';
          break;
        default:
          return;
      }
  
      const { error } = await supabase
        .from('drafts')
        .update({ 
          status: newStatus, 
          timer_expires_at: timerExpiresAt 
        })
        .eq('id', draft.id);
  
      if (error) throw error;
  
      // ✅ This will now update in real-time via subscription
    } catch (error) {
      console.error(`Error ${action}ing draft:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} the draft. Please try again.`,
        variant: "destructive",
      });
    }
  };
  

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

  const handleAutoPick = async () => {
    if (!draft) return;
  
    const currentDrafter = getCurrentDrafter();
    if (!currentDrafter) return;
  
    try {
      // Check if a pick has already been made for this draft pick number
      const { data: existingPick, error: existingPickError } = await supabase
        .from("draft_picks")
        .select("*")
        .eq("draft_id", draft.id)
        .eq("pick_number", draft.current_pick_number)
        .single();
  
      if (existingPickError && existingPickError.code !== "PGRST116") {
        throw existingPickError;
      }
  
      if (existingPick) {
        console.log(
          "Pick already made for this draft number, skipping auto-pick"
        );
        return;
      }
  
      // Filter out already drafted teams and sort by seed
      const availableUndraftedTeams = availableTeams
        .filter((team) => !draftedTeamIds.has(team.id))
        .sort((a, b) => a.global_teams?.seed - b.global_teams?.seed);
  
      const nextAvailableTeam = availableUndraftedTeams[0];
      if (!nextAvailableTeam) {
        throw new Error("No available teams left");
      }
  
      // Prepare the data for insertion
      const draftPickData: Record<string, any> = {
        draft_id: draft.id,
        league_id: leagueId,
        league_member_id: currentDrafter.id,
        team_id: nextAvailableTeam.id,
        pick_number: draft.current_pick_number,
        is_auto_pick: true,
      };
  
      // Include user_id only if it exists
      if (currentDrafter.user_id) {
        draftPickData.user_id = currentDrafter.user_id;
      }
  
      const { data, error } = await supabase
        .from("draft_picks")
        .insert(draftPickData)
        .select(
          "*, league_teams(id, name, seed, global_teams(name)), league_members(team_name, users(email, first_name, last_name))"
        )
        .single();
  
      if (error) throw error;
  
      await updateDraftState(data);
  
      toast({
        title: "Auto Pick",
        description: `${currentDrafter.team_name || "Team"} auto-drafted ${
          data.league_teams.global_teams.name
        }.`,
      });
    } catch (error) {
      console.error("Error making auto pick:", error);
      toast({
        title: "Error",
        description: "Failed to make auto pick. Please try again.",
        variant: "destructive",
      });
    }
  };
  const handleDraftPick = async (teamId: string) => {
    if (!draft || !isUsersTurn()) return;
  
    try {
      // Fetch the league_member_id for the current user
      const { data: leagueMember, error: leagueMemberError } = await supabase
        .from('league_members')
        .select('id')
        .eq('league_id', leagueId)
        .eq('user_id', currentUser)
        .single();
  
      if (leagueMemberError) throw leagueMemberError;
  
      // Check if the team has already been drafted
      if (draftedTeamIds.has(teamId)) {
        toast({
          title: "Team Already Drafted",
          description: "This team has already been drafted. Please choose another team.",
          variant: "destructive",
        });
        return;
      }
  
      // Insert the new draft pick
      const { data, error } = await supabase
        .from('draft_picks')
        .insert({
          draft_id: draft.id,
          league_id: leagueId,
          user_id: currentUser,
          league_member_id: leagueMember.id,
          team_id: teamId,
          pick_number: draft.current_pick_number,
        })
        .select('*, league_teams(*, global_teams(*))')
        .single();
  
      if (error) throw error;
  
      await updateDraftState(data);

      toast({
        title: "Team Drafted",
        description: `You have successfully drafted ${data.league_teams.name}.`,
      });
  
      // Fetch updated matchups
      fetchMatchups();
      
    } catch (error) {
      console.error('Error making draft pick:', error);
      toast({
        title: "Error",
        description: "Failed to make draft pick. Please try again.",
        variant: "destructive",
      });
    }
  };
  

  const updateDraftState = useCallback(
    async (newPick: DraftPick) => {
      // Fetch full pick details to ensure all fields are included
      const { data: pickDetails, error } = await supabase
        .from("draft_picks")
        .select(`
          *,
          league_teams (
            *,
            global_teams (
              logo_filename
            )
          )
        `)
        .eq("id", newPick.id)
        .single();
  
      if (error) {
        console.error("Error fetching full pick details:", error);
        return;
      }
  
      setDraftedTeamIds((prevIds) => new Set(prevIds).add(pickDetails.team_id));
      setDraftPicks((prevPicks) => [...prevPicks, pickDetails]);
      setAvailableTeams((prevTeams) =>
        prevTeams.filter((team) => team.id !== pickDetails.team_id)
      );
  
      const newPickNumber = draft!.current_pick_number + 1;
      const timerExpiresAt = new Date(Date.now() + draft!.draft_pick_timer * 1000).toISOString();
  
      const isDraftCompleted = newPickNumber > Math.floor(64 / maxTeams) * maxTeams;
  
      if (isDraftCompleted) {
        const endTime = new Date().toISOString();
        const { error: updateError } = await supabase
          .from("drafts")
          .update({
            current_pick_number: newPickNumber,
            status: "completed",
            end_time: endTime,
          })
          .eq("id", draft!.id);
  
        if (updateError) throw updateError;
  
        setDraft((prevDraft) => ({
          ...prevDraft!,
          current_pick_number: newPickNumber,
          status: "completed",
          end_time: endTime,
        }));
  
        toast({
          title: "Draft Completed",
          description: `The draft has been completed.`,
        });
      } else {
        const { error: updateError } = await supabase
          .from("drafts")
          .update({
            current_pick_number: newPickNumber,
            timer_expires_at: timerExpiresAt,
          })
          .eq("id", draft!.id);
  
        if (updateError) throw updateError;
  
        setDraft((prevDraft) => ({
          ...prevDraft!,
          current_pick_number: newPickNumber,
          timer_expires_at: timerExpiresAt,
        }));
      }
    },
    [draft, maxTeams, supabase, toast]
  );
  

 useEffect(() => {
  if (!draft) return;

  console.log("🕒 Listening for real-time draft updates...");

  const channel = supabase.channel(`draft_room_${draft.id}`);

  // Listen for draft pick insertions
  channel.on(
    "postgres_changes",
    { event: "INSERT", schema: "public", table: "draft_picks", filter: `draft_id=eq.${draft.id}` },
    async (payload) => {
      console.log("🔄 New draft pick detected!", payload.new);

      const { data: fullPick, error } = await supabase
        .from("draft_picks")
        .select("*, league_teams(*, global_teams(*))")
        .eq("id", payload.new.id)
        .single();

      if (error) {
        console.error("❌ Error fetching full pick details:", error);
        return;
      }

      setDraftPicks((prevPicks) => [...prevPicks, fullPick]);
      setDraftedTeamIds((prevIds) => new Set(prevIds).add(fullPick.team_id));
      setAvailableTeams((prevTeams) => prevTeams.filter((team) => team.id !== fullPick.team_id));

      // Update draft state
      setDraft((prevDraft) => ({
        ...prevDraft!,
        current_pick_number: prevDraft!.current_pick_number + 1,
        timer_expires_at: new Date(Date.now() + prevDraft!.draft_pick_timer * 1000).toISOString(),
      }));

      fetchMatchups();
    }
  );

  // Listen for updates to the draft
  channel.on(
    "postgres_changes",
    { event: "UPDATE", schema: "public", table: "drafts", filter: `id=eq.${draft.id}` },
    (payload) => {
      console.log("🔄 Draft state updated!", payload.new);
      setDraft((prevDraft) => ({
        ...prevDraft!,
        current_pick_number: payload.new.current_pick_number,
        status: payload.new.status,
        timer_expires_at: payload.new.timer_expires_at,
      }));
    }
  );

  channel.subscribe();

  return () => {
    console.log("🛑 Unsubscribing from draft updates...");
    supabase.removeChannel(channel);
  };
}, [draft, leagueId, fetchMatchups]);
  
  
  

  

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

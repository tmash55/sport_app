import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/libs/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Draft, LeagueMember, LeagueTeam, DraftPick } from "@/types/draft";

export function useDraftState(leagueId: string) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [leagueMembers, setLeagueMembers] = useState<LeagueMember[]>([]);
  const [availableTeams, setAvailableTeams] = useState<LeagueTeam[]>([]);
  const [draftPicks, setDraftPicks] = useState<DraftPick[]>([]);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCommissioner, setIsCommissioner] = useState(false);
  const [maxTeams, setMaxTeams] = useState<number>(0);
  const [draftedTeamIds, setDraftedTeamIds] = useState<Set<string>>(new Set());
  const [leagueName, setLeagueName] = useState<string | null>(null);

  const supabase = createClient();
  const { toast } = useToast();

  // Fetch Draft Data
  const fetchDraftData = useCallback(async () => {
    try {
      setIsLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setCurrentUser(user.id);

      const [
        { data: draftData },
        { data: leagueData },
        { data: leagueSettings },
        { data: members },
        { data: teams },
        { data: draftPicksData },
      ] = await Promise.all([
        supabase.from("drafts").select("*").eq("league_id", leagueId).single(),
        supabase.from("leagues").select("commissioner_id, name").eq("id", leagueId).single(),
        supabase.from("league_settings").select("max_teams").eq("league_id", leagueId).single(),
        supabase.from("league_members").select("*, users(email, first_name, last_name)").eq("league_id", leagueId),
        supabase.from("league_teams").select("*, global_teams(id, seed, logo_filename)").eq("league_id", leagueId),
        supabase
          .from("draft_picks")
          .select("*, league_teams(*, global_teams(id, seed, logo_filename)), users(email, first_name, last_name)")
          .eq("league_id", leagueId), // Fetching all draft picks at once
      ]);

      setDraft(draftData);
      setIsCommissioner(leagueData?.commissioner_id === user?.id);
      setLeagueName(leagueData?.name);
      setMaxTeams(leagueSettings?.max_teams);
      setLeagueMembers(members || []);

      const draftedIds: Set<string> = new Set(draftPicksData.map((pick) => pick.team_id as string));
      setDraftedTeamIds(draftedIds);
      setDraftPicks(draftPicksData || []);
      setAvailableTeams(teams.filter((team) => !draftedIds.has(team.id)));
    } catch (error) {
      console.error("Error fetching draft data:", error);
      toast({
        title: "Error",
        description: "Failed to load draft data. Please try refreshing the page.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [leagueId, supabase, toast]);

  // Fetch Data on Mount
  useEffect(() => {
    fetchDraftData();
  }, [fetchDraftData]); // Fix: Ensure draft data loads on mount

  // Subscribe to Real-Time Draft Picks
  useEffect(() => {
    if (!draft) return;

    const draftChannel = supabase
      .channel(`draft_picks_${draft.id}`) // Unique channel per draft
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "draft_picks", filter: `draft_id=eq.${draft.id}` },
        (payload) => {
          const newPick = payload.new as DraftPick;
          setDraftPicks((prevPicks) => {
            const pickExists = prevPicks.some((pick) => pick.id === newPick.id);
            return pickExists ? prevPicks : [...prevPicks, newPick];
          });

          setDraftedTeamIds((prevIds) => new Set([...Array.from(prevIds), newPick.team_id]));
          setAvailableTeams((prevTeams) => prevTeams.filter((team) => team.id !== newPick.team_id));

          setDraft((prevDraft) => ({
            ...prevDraft!,
            current_pick_number: prevDraft!.current_pick_number + 1,
            timer_expires_at: new Date(Date.now() + draft.draft_pick_timer * 1000).toISOString(),
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(draftChannel);
    };
  }, [draft, supabase]);

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
    setDraft,
    setDraftPicks,
    setAvailableTeams,
    setDraftedTeamIds,
  };
}

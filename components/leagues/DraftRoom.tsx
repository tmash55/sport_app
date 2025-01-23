"use client"

import { useState, useEffect, useCallback } from 'react'
import { createClient } from "@/libs/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { DraftBoard } from "./DraftBoard"
import { DraftControls } from "./DraftControls"
import { DraftStatus } from "./DraftStatus"
import { DraftTimer } from "./DraftTimer"
import { LeagueMember, LeagueTeam, DraftPick, Draft } from "@/types/draft"
import { Skeleton } from "@/components/ui/skeleton"
import { DraftInfoDrawer } from './DraftInfoDrawer'
import { RecentPicks } from './RecentPicks'


interface DraftRoomProps {
  leagueId: string
  isCommissioner: boolean
  currentUser: string | null
  maxTeams: number
  
}
const TOTAL_SLOTS = 8;
const TOTAL_ROUNDS = 8;

export function DraftRoom({ leagueId }: DraftRoomProps) {
  const [leagueMembers, setLeagueMembers] = useState<LeagueMember[]>([])
  const [availableTeams, setAvailableTeams] = useState<LeagueTeam[]>([])
  const [draftPicks, setDraftPicks] = useState<DraftPick[]>([])
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [isCommissioner, setIsCommissioner] = useState(false)
  const [maxTeams, setMaxTeams] = useState<number>(0)
  const [draftedTeamIds, setDraftedTeamIds] = useState<Set<string>>(new Set())
  const [leagueName, setLeagueName] = useState<string | null>(null)
  const supabase = createClient()
  const { toast } = useToast()

  

  // Fetch initial draft data
  const fetchDraftData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUser(user.id)
      }

      const { data: draftData } = await supabase
        .from("drafts")
        .select("*")
        .eq("league_id", leagueId)
        .single()

      setDraft(draftData)

      const { data: leagueData } = await supabase
        .from("leagues")
        .select("commissioner_id, name")
        .eq("id", leagueId)
        .single()

      setIsCommissioner(leagueData.commissioner_id === user?.id)
      setLeagueName(leagueData.name)

      const { data: leagueSettings } = await supabase
        .from("league_settings")
        .select("max_teams")
        .eq("league_id", leagueId)
        .single()

      setMaxTeams(leagueSettings.max_teams)

      const { data: members } = await supabase
        .from("league_members")
        .select("*, users(email, first_name, last_name)")
        .eq("league_id", leagueId)

      setLeagueMembers(members)

      const { data: teams } = await supabase
        .from("league_teams")
        .select("*, global_teams(seed, logo_filename)")
        .eq("league_id", leagueId)

      setAvailableTeams(teams)

      const { data: picks } = await supabase
        .from("draft_picks")
        .select("*, league_teams(*, global_teams(seed, logo_filename)), users(email, first_name, last_name)")
        .eq("draft_id", draftData.id)

      setDraftPicks(picks)
      setDraftedTeamIds(new Set(picks.map((pick) => pick.team_id)))
    } catch (error) {
      console.error("Error fetching draft data:", error)
      toast({
        title: "Error",
        description: "Failed to load draft data. Please try refreshing the page.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [leagueId, supabase, toast])

  // Real-time updates for draft status
  useEffect(() => {
    if (!draft) return

    const draftChannel = supabase
      .channel(`draft:${draft.id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "drafts", filter: `id=eq.${draft.id}` }, (payload) => {
        setDraft((prev) => ({ ...prev, ...payload.new }))
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "draft_picks", filter: `draft_id=eq.${draft.id}` }, (payload) => {
        const newPick = payload.new as DraftPick
        setDraftPicks((prevPicks) => [...prevPicks, newPick])
        setDraftedTeamIds((prevIds) => new Set(prevIds).add(newPick.team_id))
        setAvailableTeams((prevTeams) => prevTeams.filter((team) => team.id !== newPick.team_id))
      })
      .subscribe()

    return () => {
      supabase.removeChannel(draftChannel)
    }
  }, [draft, supabase])

  useEffect(() => {
    fetchDraftData()
  }, [fetchDraftData])


  useEffect(() => {
    const draftPicksChannel = supabase
      .channel('draft_picks')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'draft_picks',
        filter: `draft_id=eq.${draft?.id}`
      }, (payload) => {
        const newPick = payload.new as DraftPick;
        updateDraftState(newPick);
      })
      .subscribe()

    return () => {
      supabase.removeChannel(draftPicksChannel)
    }
  }, [draft?.id, supabase])

  const handleDraftAction = async (action: 'start' | 'pause' | 'resume') => {
    if (!draft) return

    try {
      let newStatus: Draft['status']
      let timerExpiresAt: string | null = null
      switch (action) {
        case 'start':
        case 'resume':
          newStatus = 'in_progress'
          timerExpiresAt = new Date(Date.now() + draft.draft_pick_timer * 1000).toISOString()
          break
        case 'pause':
          newStatus = 'paused'
          break
        default:
          return
      }

      const { error } = await supabase
        .from('drafts')
        .update({ 
          status: newStatus, 
          timer_expires_at: timerExpiresAt 
        })
        .eq('id', draft.id)

      if (error) throw error

      setDraft(prevDraft => ({ 
        ...prevDraft!, 
        status: newStatus, 
        timer_expires_at: timerExpiresAt 
      }))

      toast({
        title: `Draft ${action}ed`,
        description: `The draft has been successfully ${action}ed.`,
      })
    } catch (error) {
      console.error(`Error ${action}ing draft:`, error)
      toast({
        title: "Error",
        description: `Failed to ${action} the draft. Please try again.`,
        variant: "destructive",
      })
    }
  }

  const handleStartDraft = () => handleDraftAction('start')
  const handlePauseDraft = () => handleDraftAction('pause')
  const handleResumeDraft = () => handleDraftAction('resume')

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
  
      const { data, error } = await supabase
        .from('draft_picks')
        .insert({
          draft_id: draft.id,
          league_id: leagueId,
          user_id: currentUser,
          league_member_id: leagueMember.id, 
          team_id: teamId,
          pick_number: draft.current_pick_number
        })
        .select('*, league_teams(*), users(email, first_name, last_name)')
        .single();
  
      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Team Already Drafted",
            description: "This team has already been drafted. Please choose another team.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }
  
      updateDraftState(data);
  
      toast({
        title: "Team Drafted",
        description: `You have successfully drafted ${data.league_teams.name}.`,
      });
    } catch (error) {
      console.error('Error making draft pick:', error);
      toast({
        title: "Error",
        description: "Failed to make draft pick. Please try again.",
        variant: "destructive",
      });
    }
  };

  const checkDraftCompletion = useCallback(async () => {
    if (!draft || !maxTeams) return false;
  
    // Calculate total picks based on maxTeams
    const rounds = Math.floor(64 / maxTeams);
    const totalPicks = rounds * maxTeams;
  
    console.log(`Draft completion check: maxTeams=${maxTeams}, rounds=${rounds}, totalPicks=${totalPicks}, currentPick=${draft.current_pick_number}`);
  
    if (draft.current_pick_number >= totalPicks) {
      console.log(`Draft completed: currentPick=${draft.current_pick_number} >= totalPicks=${totalPicks}`);
      try {
        // Mark the draft as completed
        const { error } = await supabase
          .from('drafts')
          .update({ 
            status: 'completed',
            end_time: new Date().toISOString(),
          })
          .eq('id', draft.id);
  
        if (error) throw error;
  
        setDraft(prevDraft => ({
          ...prevDraft!,
          status: 'completed',
          end_time: new Date().toISOString(),
        }));
  
        toast({
          title: "Draft Completed",
          description: `The draft has been completed with ${totalPicks} picks. ${64 - totalPicks} teams remain undrafted.`,
        });
  
        return true;
      } catch (error) {
        console.error('Error completing draft:', error);
        toast({
          title: "Error",
          description: "Failed to complete the draft. Please try again.",
          variant: "destructive",
        });
      }
    }
  
    return false;
  }, [draft, maxTeams, supabase, toast]);
  
  
  

  
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
  
  

  const renderDraftBoardSkeleton = () => {
    const board = []

    // Header row
    const headerRow = []
    for (let slot = 0; slot < TOTAL_SLOTS; slot++) {
      headerRow.push(
        <div key={`header-${slot}`} className="p-2">
          <Skeleton className="h-6 w-full" />
        </div>
      )
    }
    board.push(<div key="header" className="contents">{headerRow}</div>)

    // Draft board rows
    for (let round = 0; round < TOTAL_ROUNDS; round++) {
      const rowCells = []
      for (let slot = 0; slot < TOTAL_SLOTS; slot++) {
        rowCells.push(
          <div key={`${round}-${slot}`} className="relative bg-secondary p-2 rounded border border-secondary-foreground/20">
            <div className="h-12 rounded flex flex-col items-center justify-center p-1">
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        )
      }
      board.push(
        <div key={round} className="contents">
          {rowCells}
        </div>
      )
    }

    return board
  }


  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        
        <div className="flex-grow grid grid-cols-1 gap-6 p-6 overflow-auto mt-8">
          <div className="space-y-6">
            <Card>
              
              <CardContent>
                <div className="grid grid-cols-8 gap-2 min-w-[800px]">
                  {renderDraftBoardSkeleton()}
                </div>
              </CardContent>
            </Card>
            
          </div>
          
        </div>
      </div>
    )
  }


  return (
    <div className="container mx-auto px-4 py-8">
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span className="text-xl">{leagueName}</span>
            <DraftStatus 
              status={draft?.status || 'pre_draft'} 
              currentPickNumber={draft?.current_pick_number || 0} 
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {isCommissioner && draft?.status !== 'completed' && (
            <DraftControls
              draftStatus={draft?.status || 'pre_draft'}
              onStartDraft={handleStartDraft}
              onPauseDraft={handlePauseDraft}
              onResumeDraft={handleResumeDraft}
            />
          )}
          {draft && draft.status === 'in_progress' && (
            <DraftTimer
              draftId={draft.id}
              status={draft.status}
              timerExpiresAt={draft.timer_expires_at}
              onTimerExpire={handleAutoPick}
            />
          )}
          <RecentPicks
            draftPicks={draftPicks}
            leagueMembers={leagueMembers}
            currentPickNumber={draft?.current_pick_number || 0}
          />
          <div className="overflow-x-auto">
            <DraftBoard
              leagueMembers={leagueMembers}
              draftPicks={draftPicks}
              currentPickNumber={draft?.current_pick_number || 0}
              maxTeams={maxTeams}
              isDraftCompleted={draft?.status === 'completed'}
            />
          </div>
        </CardContent>
      </Card>
      <DraftInfoDrawer
        draft={draft}
        availableTeams={availableTeams}
        draftedTeamIds={draftedTeamIds}
        draftPicks={draftPicks}
        currentUser={currentUser}
        maxTeams={maxTeams}
        isUsersTurn={isUsersTurn}
        handleDraftPick={handleDraftPick}
      />
    </div>
  </div>
  )
}


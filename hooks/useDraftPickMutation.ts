import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/libs/supabase/client"
import type { DraftPick, LeagueTeam, Draft } from "@/types/draft"

const supabase = createClient()

interface DraftPickParams {
  draftId: string
  leagueId: string
  userId: string
  teamId: string
}

const makeDraftPick = async ({ draftId, leagueId, userId, teamId }: DraftPickParams) => {
  const { data, error } = await supabase.rpc("make_draft_pick2", {
    p_draft_id: draftId,
    p_league_id: leagueId,
    p_user_id: userId,
    p_team_id: teamId,
  })

  if (error) throw error
  return data as DraftPick
}

export function useDraftPickMutation(leagueId: string) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: makeDraftPick,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["draftPicks", variables.draftId] })
      await queryClient.cancelQueries({ queryKey: ["leagueTeams", leagueId] })
      await queryClient.cancelQueries({ queryKey: ["draft", leagueId] })

      const previousDraftPicks = queryClient.getQueryData<DraftPick[]>(["draftPicks", variables.draftId])
      const previousLeagueTeams = queryClient.getQueryData<LeagueTeam[]>(["leagueTeams", leagueId])
      const previousDraft = queryClient.getQueryData<Draft>(["draft", leagueId])

      const leagueMembers = queryClient.getQueryData<any[]>(["leagueMembers", leagueId])
      const currentLeagueMember = leagueMembers?.find((member) => member.user_id === variables.userId)

      queryClient.setQueryData<DraftPick[]>(["draftPicks", variables.draftId], (old = []) => {
        const newPick: DraftPick = {
          id: `temp-${Date.now()}`,
          draft_id: variables.draftId,
          league_id: leagueId,
          user_id: variables.userId,
          league_member_id: currentLeagueMember?.id || "",
          team_id: variables.teamId,
          pick_number: old.length + 1,
          created_at: new Date().toISOString(),
          league_teams: previousLeagueTeams?.find((team) => team.id === variables.teamId) || ({} as LeagueTeam),
          is_auto_pick: false,
          users: currentLeagueMember?.users || {
            email: "placeholder@example.com",
            first_name: null,
            last_name: null,
            display_name: null,
          },
          league_member: {
            id: currentLeagueMember?.id || "",
            team_name: currentLeagueMember?.team_name || null,
            users: {
              display_name: currentLeagueMember?.users?.display_name || null,
            },
          },
        }
        return [...old, newPick]
      })

      queryClient.setQueryData<LeagueTeam[]>(["leagueTeams", leagueId], (old = []) =>
        old.filter((team) => team.id !== variables.teamId),
      )

      queryClient.setQueryData<Draft>(["draft", leagueId], (old) => {
        if (!old) return old;
        return {
          ...old,
          current_pick_number: (old.current_pick_number || 0) + 1,
          timer_expires_at: old.timer_expires_at, // ✅ Do not override, let real-time update it
        };
      });
      

      return { previousDraftPicks, previousLeagueTeams, previousDraft }
    },
    onError: (err, variables, context) => {
      if (context) {
        queryClient.setQueryData(["draftPicks", variables.draftId], context.previousDraftPicks)
        queryClient.setQueryData(["leagueTeams", leagueId], context.previousLeagueTeams)
        queryClient.setQueryData(["draft", leagueId], context.previousDraft)
      }
      console.error("Error making draft pick:", err)
      toast({
        title: "Error",
        description: "Failed to make draft pick. Please try again.",
        variant: "destructive",
      })
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: ["draftPicks", variables.draftId] })
      queryClient.invalidateQueries({ queryKey: ["leagueTeams", leagueId] })
      queryClient.invalidateQueries({ queryKey: ["draft", leagueId] })
    },
    onSuccess: (data, variables) => {
        queryClient.setQueryData<DraftPick[]>(["draftPicks", variables.draftId], (old = []) =>
        old.map((pick) => (pick.team_id === variables.teamId ? data : pick)), // ✅ Match by `team_id`
      );
      
      toast({
        title: "Team Drafted",
        description: "You have successfully drafted a team.",
      })
    },
  })
}


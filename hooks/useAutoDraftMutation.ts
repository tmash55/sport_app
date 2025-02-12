import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/libs/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { DraftPick } from "@/types/draft"

const supabase = createClient()

export function useAutoDraftMutation(leagueId: string) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const autoDraftMutation = useMutation({
    mutationFn: async (draftId: string) => {
      const { data: draft, error: draftError } = await supabase
        .from("drafts")
        .select("*")
        .eq("id", draftId)
        .single()

      if (draftError) throw draftError
      if (!draft) throw new Error("Draft not found")

      // Fetch current drafter
      const { data: leagueMembers } = await supabase
        .from("league_members")
        .select("*")
        .eq("league_id", leagueId)

      const totalMembers = leagueMembers.length
      const pickInRound = (draft.current_pick_number - 1) % totalMembers
      const roundNumber = Math.floor((draft.current_pick_number - 1) / totalMembers) + 1
      const draftPosition = roundNumber % 2 === 1 ? pickInRound + 1 : totalMembers - pickInRound
      const currentDrafter = leagueMembers.find((member) => member.draft_position === draftPosition)

      if (!currentDrafter) throw new Error("No drafter found")

      // Prevent duplicate auto-picks
      const { data: existingPick } = await supabase
        .from("draft_picks")
        .select("id")
        .eq("draft_id", draft.id)
        .eq("pick_number", draft.current_pick_number)
        .single()

      if (existingPick) {
        console.log("Pick already made, skipping auto-pick")
        return
      }

      // Fetch available teams
      const { data: availableTeams } = await supabase
        .from("league_teams")
        .select("*, global_teams(id, seed, logo_filename)")
        .eq("league_id", leagueId)

      if (!availableTeams || availableTeams.length === 0) throw new Error("No available teams left")

      // Get next best available team
      const nextAvailableTeam = availableTeams.sort((a, b) => a.global_teams?.seed - b.global_teams?.seed)[0]

      if (!nextAvailableTeam) throw new Error("No valid team to draft")

      // ✅ Insert draft pick with `user_id` as null if no assigned user
      const draftPickData: Partial<DraftPick> = {
        draft_id: draft.id,
        league_id: leagueId,
        league_member_id: currentDrafter.id,
        team_id: nextAvailableTeam.id,
        pick_number: draft.current_pick_number,
        is_auto_pick: true,
        user_id: currentDrafter.user_id ?? null, // ✅ Ensure it's a UUID or null
      }

      const { data: insertedPick, error: insertError } = await supabase
        .from("draft_picks")
        .insert(draftPickData)
        .select("id")
        .single()

      if (insertError) throw insertError

      // Increment draft pick
      const newPickNumber = draft.current_pick_number + 1
      const timerExpiresAt = new Date(Date.now() + draft.draft_pick_timer * 1000).toISOString()

      await supabase
        .from("drafts")
        .update({
          current_pick_number: newPickNumber,
          timer_expires_at: timerExpiresAt,
        })
        .eq("id", draft.id)

      // Invalidate queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ["draftPicks", draft.id] })
      queryClient.invalidateQueries({ queryKey: ["leagueTeams", leagueId] })
      queryClient.invalidateQueries({ queryKey: ["draft", leagueId] })

      toast({
        title: "Auto Pick",
        description: `${currentDrafter.team_name || "Team"} auto-drafted ${nextAvailableTeam.global_teams.name}.`,
      })
    },
    onError: (error) => {
      console.error("Error making auto pick:", error)
      toast({
        title: "Error",
        description: "Failed to make auto pick. Please try again.",
        variant: "destructive",
      })
    },
  })

  return { handleAutoPick: autoDraftMutation.mutate, isAutoPicking: autoDraftMutation.isPending }
}

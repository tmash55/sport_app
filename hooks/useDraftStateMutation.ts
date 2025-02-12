import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/libs/supabase/client"
import { useToast } from "@/hooks/use-toast"
import type { DraftPick, Draft } from "@/types/draft"

const supabase = createClient()

interface UpdateDraftStateParams {
  newPick: DraftPick
  draftId: string
  draftPickTimer: number
  totalPicks: number
}

export function useDraftStateMutation() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const updateDraftStateMutation = useMutation({
    mutationFn: async ({ newPick, draftId, draftPickTimer, totalPicks }: UpdateDraftStateParams) => {
      const newPickNumber = newPick.pick_number + 1
      const isDraftCompleted = newPickNumber > totalPicks
      const timerExpiresAt = new Date(Date.now() + draftPickTimer * 1000).toISOString()

      if (isDraftCompleted) {
        const endTime = new Date().toISOString()

        const { error } = await supabase
          .from("drafts")
          .update({ status: "completed", end_time: endTime })
          .eq("id", draftId)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from("drafts")
          .update({ current_pick_number: newPickNumber, timer_expires_at: timerExpiresAt })
          .eq("id", draftId)

        if (error) throw error
      }

      return newPick
    },
    onSuccess: async (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["draft", variables.draftId] }) // Refresh draft data
      queryClient.invalidateQueries({ queryKey: ["draftPicks", variables.draftId] }) // Refresh draft picks
      queryClient.invalidateQueries({ queryKey: ["leagueTeams", variables.newPick.league_id] }) // Refresh available teams

      toast({
        title: "Draft Updated",
        description: `Draft state has been updated successfully.`,
      })
    },
    onError: (error) => {
      console.error("Error updating draft state:", error)
      toast({
        title: "Error",
        description: "Failed to update draft state. Please try again.",
        variant: "destructive",
      })
    },
  })

  return updateDraftStateMutation
}

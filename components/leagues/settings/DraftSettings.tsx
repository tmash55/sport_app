import { useState, useEffect } from 'react'
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/libs/supabase/client"

interface DraftSettingsProps {
  leagueId: string
  isCommissioner: boolean
  draft: any
  onUpdate: () => void
}

const timerOptions = [
  { label: "10 seconds", value: "10" },
  { label: "30 seconds", value: "30" },
  { label: "60 seconds", value: "60" },
  { label: "1.5 minutes", value: "90" },
  { label: "2 minutes", value: "120" },
  { label: "5 minutes", value: "300" },
  { label: "10 minutes", value: "600" },
  { label: "1 hour", value: "3600" },
  { label: "2 hours", value: "7200" },
  { label: "4 hours", value: "14400" },
  { label: "8 hours", value: "28800" },
  { label: "12 hours", value: "43200" },
  { label: "24 hours", value: "86400" },
]

export function DraftSettings({ leagueId, isCommissioner, draft, onUpdate }: DraftSettingsProps) {
  const [draftPickTimer, setDraftPickTimer] = useState<string>(
    draft?.draft_pick_timer === 99999 ? "99999" : (draft?.draft_pick_timer?.toString() || "99999")
  )
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    setDraftPickTimer(
      draft?.draft_pick_timer === 99999 ? "99999" : (draft?.draft_pick_timer?.toString() || "99999")
    )
  }, [draft])

  const handleSave = async () => {
    if (!isCommissioner) return

    setIsLoading(true)
    try {
      const timerValue = parseInt(draftPickTimer)

      const { error } = await supabase
        .from('drafts')
        .update({ draft_pick_timer: timerValue })
        .eq('league_id', leagueId)

      if (error) throw error

      onUpdate()
      

      toast({
        title: "Success",
        description: "Draft settings updated successfully.",
      })
    } catch (error) {
      console.error('Error updating draft settings:', error)
      toast({
        title: "Error",
        description: "Failed to update draft settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="draftPickTimer">Draft Pick Timer</Label>
        <Select
          value={draftPickTimer}
          onValueChange={setDraftPickTimer}
          disabled={!isCommissioner || isLoading}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select draft pick time limit" />
          </SelectTrigger>
          <SelectContent>
            {timerOptions.map((option) => (
              <SelectItem key={option.label} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button onClick={handleSave} disabled={!isCommissioner || isLoading}>
        {isLoading ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  )
}


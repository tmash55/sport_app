"use client"

import { useState, useEffect, useCallback } from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface Draft {
  status: string
  draft_pick_timer: number
}

interface DraftSettingsProps {
  leagueId: string
  isCommissioner: boolean
  draft: Draft
  onUpdate: (updatedData: Partial<Draft>) => Promise<void>
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
  { label: "No Limit", value: "99999" },
]

export function DraftSettings({ leagueId, isCommissioner, draft, onUpdate }: DraftSettingsProps) {
  const [draftSettings, setDraftSettings] = useState<Draft | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    console.log("DraftSettings: draft updated", draft)
    if (draft) {
      setDraftSettings(draft)
    }
  }, [draft])

  const handleInputChange = (value: string) => {
    if (draftSettings) {
      setDraftSettings((prev) => ({ ...prev, draft_pick_timer: Number.parseInt(value) || 99999 }))
    }
  }

  const handleSave = useCallback(async () => {
    if (!isCommissioner || !draftSettings) return

    console.log("DraftSettings: handleSave called")
    console.log("Current settings:", draftSettings)

    setIsLoading(true)
    try {
      await onUpdate({ draft_pick_timer: draftSettings.draft_pick_timer })
      toast({
        title: "Success",
        description: "Draft settings updated successfully.",
      })
    } catch (error) {
      console.error("Error updating draft settings:", error)
      toast({
        title: "Error",
        description: "Failed to update draft settings. Please try again.",
        variant: "destructive",
      })
      // Revert to the last known good state
      setDraftSettings(draft)
    } finally {
      setIsLoading(false)
    }
  }, [isCommissioner, draftSettings, onUpdate, toast, draft])

  if (!draftSettings) {
    return <div>Loading draft settings...</div>
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="draftPickTimer">Draft Pick Timer</Label>
        <Select
          value={(draftSettings.draft_pick_timer ?? 99999).toString()}
          onValueChange={handleInputChange}
          disabled={!isCommissioner || isLoading}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select draft pick time limit" />
          </SelectTrigger>
          <SelectContent>
            {timerOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
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


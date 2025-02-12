"use client"

import { useState, useEffect, useCallback } from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

interface Draft {
  status: string
  draft_pick_timer: number
}

interface DraftSettingsProps {
  leagueId: string
  isCommissioner: boolean
  draft: Draft | null
  onUpdate: (updatedData: Partial<Draft>) => Promise<void>
}

const timerOptions = [
  { label: "1 minute", value: "60" },
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
  const [draftSettings, setDraftSettings] = useState<Draft | null>(null)
  const [selectedTimer, setSelectedTimer] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (draft) {
      setDraftSettings(draft)
      setSelectedTimer(draft.draft_pick_timer.toString())
    }
  }, [draft])

  const handleInputChange = (value: string) => {
    setSelectedTimer(value)
  }

  const handleSave = useCallback(async () => {
    if (!isCommissioner || !draftSettings) return

    setIsLoading(true)
    try {
      const updatedSettings = {
        ...draftSettings,
        draft_pick_timer: Number.parseInt(selectedTimer),
      }
      await onUpdate({ draft_pick_timer: updatedSettings.draft_pick_timer })
      setDraftSettings(updatedSettings)
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
    } finally {
      setIsLoading(false)
    }
  }, [isCommissioner, draftSettings, selectedTimer, onUpdate, toast])

  if (!draftSettings) {
    return <div>Loading draft settings...</div>
  }

  const currentTimerOption = timerOptions.find((option) => option.value === selectedTimer)
  const currentTimerLabel = currentTimerOption ? currentTimerOption.label : "Custom"
  const isDraftStarted = draftSettings.status !== "pre_draft"
  const isDraftCompleted = draft.status === "completed"

  return (
    <Card>
      <CardHeader>
        <CardTitle>Draft Settings</CardTitle>
        <CardDescription>Configure the settings for your league&apos;s draft.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isDraftStarted && !isDraftCompleted && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              Changing draft settings after the draft has started may affect the fairness of the draft. Proceed with
              caution.
            </AlertDescription>
          </Alert>
        )}
        {isDraftCompleted && (
          <p className="text-sm font-medium text-muted-foreground">
            The draft has been completed. Settings can no longer be modified.
          </p>
        )}
        <div className="space-y-2">
          <Label htmlFor="draftPickTimer">Draft Pick Timer</Label>
          <Select
            value={selectedTimer}
            onValueChange={handleInputChange}
            disabled={!isCommissioner || isLoading || isDraftStarted || isDraftCompleted}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select draft pick time limit">{currentTimerLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {timerOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            {isDraftStarted && !isDraftCompleted && "This cannot be changed after the draft has started."}
            {isDraftCompleted && "The draft has been completed and settings can no longer be modified."}
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={!isCommissioner || isLoading || isDraftStarted || isDraftCompleted}
          className="w-full"
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </CardContent>
    </Card>
  )
}


"use client"

import { useState, useEffect, useCallback } from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
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
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Draft Settings</h2>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSave()
        }}
      >
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Draft Pick Timer</CardTitle>
            <CardDescription>Set the amount of time each member has to make their draft pick.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isDraftStarted && !isDraftCompleted && (
              <Alert className="bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800">
              <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <div className="ml-2">
              <AlertTitle className="text-orange-800 dark:text-orange-300 text-sm">Warning</AlertTitle>
              <AlertDescription className="text-orange-700 dark:text-orange-400 text-xs">
                  Changing draft settings after the draft has started may affect the fairness of the draft. Proceed with
                  caution.
                </AlertDescription>
                </div>
              </Alert>
            )}
            {isDraftCompleted && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Draft Completed</AlertTitle>
                <AlertDescription>The draft has been completed. Settings can no longer be modified.</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="draftPickTimer">Time Limit</Label>
              <Select
                value={selectedTimer}
                onValueChange={handleInputChange}
                disabled={!isCommissioner || isLoading || isDraftStarted || isDraftCompleted}
              >
                <SelectTrigger id="draftPickTimer" className="max-w-md">
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
                {!isDraftStarted && "Choose how long each member has to make their selection during the draft."}
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              onClick={handleSave}
              disabled={!isCommissioner || isLoading || isDraftStarted || isDraftCompleted}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}


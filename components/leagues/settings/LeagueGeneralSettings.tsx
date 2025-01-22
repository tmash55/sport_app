"use client"

import { useState, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/libs/supabase/client"
import { updateLeagueMaxTeams } from "@/app/actions/league-actions"

interface LeagueGeneralSettingsProps {
  leagueId: string
  isCommissioner: boolean
  league: {
    name: string
  }
  leagueSettings: {
    max_teams: number
  }
  draft: {
    status: string
  }
  onUpdate: (updatedData: any) => Promise<void>
}

export function LeagueGeneralSettings({
  leagueId,
  isCommissioner,
  league,
  leagueSettings,
  draft,
  onUpdate,
}: LeagueGeneralSettingsProps) {
  const [leagueName, setLeagueName] = useState(league.name)
  const [maxTeams, setMaxTeams] = useState(leagueSettings.max_teams)
  const [isLoading, setIsLoading] = useState(false)
  const isDraftStarted = draft?.status !== "pre_draft"
  const { toast } = useToast()
  const supabase = createClient()

  const handleSave = useCallback(async () => {
    if (!isCommissioner) return
    setIsLoading(true)

    try {
      const updatedData: { name?: string; max_teams?: number } = {}

      // Update league name if changed
      if (leagueName !== league.name) {
        updatedData.name = leagueName
      }

      // Update max_teams if changed and draft hasn't started
      if (maxTeams !== leagueSettings.max_teams && !isDraftStarted) {
        updatedData.max_teams = maxTeams
      }

      // Only proceed if there are changes
      if (Object.keys(updatedData).length === 0) {
        toast({
          title: "No Changes",
          description: "No changes were made to the league settings.",
        })
        setIsLoading(false)
        return
      }

      // Update league name
      if (updatedData.name) {
        const { error: leagueError } = await supabase
          .from("leagues")
          .update({ name: updatedData.name })
          .eq("id", leagueId)

        if (leagueError) throw leagueError
      }

      // Update max_teams
      if (updatedData.max_teams) {
        const result = await updateLeagueMaxTeams(leagueId, updatedData.max_teams)

        if (result.error) {
          if (result.error.includes("Cannot reduce league size")) {
            toast({
              title: "Error",
              description: "The league is full. Please remove users before reducing the league size.",
              variant: "destructive",
            })
            setIsLoading(false)
            return
          } else {
            throw new Error(result.error)
          }
        }
      }

      // Call the onUpdate prop with the updated data
      await onUpdate(updatedData)

      toast({
        title: "Success",
        description: "League settings updated successfully.",
      })
    } catch (error) {
      console.error("Error updating league settings:", error)
      toast({
        title: "Error",
        description: "Failed to update league settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [
    leagueId,
    isCommissioner,
    leagueName,
    maxTeams,
    league.name,
    leagueSettings.max_teams,
    isDraftStarted,
    onUpdate,
    supabase,
    toast,
  ])

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="leagueName">League Name</Label>
        <Input
          id="leagueName"
          value={leagueName}
          onChange={(e) => setLeagueName(e.target.value)}
          disabled={!isCommissioner || isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="maxTeams">Max Teams</Label>
        <Input
          id="maxTeams"
          type="number"
          min={4}
          max={12}
          value={maxTeams}
          onChange={(e) => setMaxTeams(Number.parseInt(e.target.value, 10))}
          disabled={!isCommissioner || isLoading || isDraftStarted}
        />
        {isDraftStarted && (
          <p className="text-sm text-muted-foreground">Max teams cannot be changed after the draft has started.</p>
        )}
      </div>
      <Button onClick={handleSave} disabled={!isCommissioner || isLoading}>
        {isLoading ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  )
}


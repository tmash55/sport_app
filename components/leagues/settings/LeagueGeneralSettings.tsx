"use client"

import { useState, useCallback, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface LeagueGeneralSettingsProps {
  leagueId: string
  isCommissioner: boolean
  league: {
    name: string
    draft_status: string
    max_teams: number
    drafts: {
      status: string
    }
  }
  leagueSettings: any
  onUpdate: (updatedData: any) => Promise<void>
}

export function LeagueGeneralSettings({ leagueId, isCommissioner, league, leagueSettings, onUpdate }: LeagueGeneralSettingsProps) {
  const [leagueName, setLeagueName] = useState(league.name)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setLeagueName(league.name)
  }, [league.name])

  const handleSave = useCallback(async () => {
    if (!isCommissioner) return
    setIsLoading(true)

    try {
      const updatedData: { name?: string } = {}

      if (leagueName !== league.name) {
        updatedData.name = leagueName
      }

      if (Object.keys(updatedData).length === 0) {
        toast({
          title: "No Changes",
          description: "No changes were made to the league settings.",
        })
        setIsLoading(false)
        return
      }

      await onUpdate(updatedData)

      toast({
        title: "Success",
        description: "League name updated successfully.",
      })
    } catch (error) {
      console.error("Error updating league settings:", error)
      toast({
        title: "Error",
        description: "Failed to update league name. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [isCommissioner, leagueName, league, onUpdate, toast])

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
        <Label>Max Teams</Label>
        <p className="text-sm font-medium">{league.max_teams} teams</p>
        <p className="text-sm text-muted-foreground mt-1">
          The maximum number of teams for this league is fixed and cannot be changed.
        </p>
      </div>
      <Button onClick={handleSave} disabled={!isCommissioner || isLoading}>
        {isLoading ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  )
}


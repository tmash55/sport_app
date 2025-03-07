"use client"

import { useState, useCallback, useEffect } from "react"
import { Input } from "@/components/ui/input"
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

export function LeagueGeneralSettings({
  leagueId,
  isCommissioner,
  league,
  leagueSettings,
  onUpdate,
}: LeagueGeneralSettingsProps) {
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
          description: "No changes were made to the pool settings.",
        })
        setIsLoading(false)
        return
      }

      await onUpdate(updatedData)

      toast({
        title: "Success",
        description: "Pool name updated successfully.",
      })
    } catch (error) {
      console.error("Error updating pool settings:", error)
      toast({
        title: "Error",
        description: "Failed to update pool name. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [isCommissioner, leagueName, league, onUpdate, toast])

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Pool Name</h2>
          <Input
            value={leagueName}
            onChange={(e) => setLeagueName(e.target.value)}
            disabled={!isCommissioner || isLoading}
            className="max-w-2xl"
            placeholder="Enter pool name"
          />
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Pool Members</h2>
          <p className="text-lg font-semibold">{league.max_teams} members</p>
          <p className="text-muted-foreground text-sm">
            The total number of players for this pool is fixed and cannot be changed.
          </p>
        </div>
      </div>

      <Button onClick={handleSave} disabled={!isCommissioner || isLoading}>
        {isLoading ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  )
}


import { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/libs/supabase/client"

interface LeagueGeneralSettingsProps {
  leagueId: string
  isCommissioner: boolean
  league: any
  leagueSettings: any
  draft: any
  onUpdate: () => void
}

export function LeagueGeneralSettings({ 
  leagueId, 
  isCommissioner, 
  league, 
  leagueSettings, 
  draft,
  onUpdate 
}: LeagueGeneralSettingsProps) {
  const [leagueName, setLeagueName] = useState(league?.name || '')
  const [maxTeams, setMaxTeams] = useState(leagueSettings?.max_teams || 0)
  const [isLoading, setIsLoading] = useState(false)
  const [isDraftStarted, setIsDraftStarted] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    setLeagueName(league?.name || '')
    setMaxTeams(leagueSettings?.max_teams || 0)
    setIsDraftStarted(draft?.status !== 'pre_draft')
  }, [league, leagueSettings, draft])

  const handleSave = async () => {
    if (!isCommissioner) return
    setIsLoading(true)

    try {
      const { error: leagueError } = await supabase
        .from('leagues')
        .update({ name: leagueName })
        .eq('id', leagueId)

      if (leagueError) throw leagueError

      if (draft?.status === 'pre_draft') {
        const { error: settingsError } = await supabase
          .from('league_settings')
          .update({ max_teams: maxTeams })
          .eq('league_id', leagueId)

        if (settingsError) throw settingsError
      }

      onUpdate()

      toast({
        title: "Success",
        description: "League settings updated successfully.",
      })
    } catch (error) {
      console.error('Error updating league settings:', error)
      toast({
        title: "Error",
        description: "Failed to update league settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

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
          max={16}
          value={maxTeams}
          onChange={(e) => setMaxTeams(parseInt(e.target.value))}
          disabled={!isCommissioner || isLoading || isDraftStarted}
        />
        {isDraftStarted && (
          <p className="text-sm text-muted-foreground">
            Max teams cannot be changed after the draft has started.
          </p>
        )}
      </div>
      <Button onClick={handleSave} disabled={!isCommissioner || isLoading}>
        {isLoading ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  )
}


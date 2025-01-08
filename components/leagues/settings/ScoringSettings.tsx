import { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/libs/supabase/client"

interface ScoringSettingsProps {
  leagueId: string
  isCommissioner: boolean
  leagueSettings: any
  onUpdate: () => void
}

export function ScoringSettings({ leagueId, isCommissioner, leagueSettings, onUpdate }: ScoringSettingsProps) {
  const [roundScores, setRoundScores] = useState([1, 2, 4, 8, 16, 32])
  const [upsetMultiplier, setUpsetMultiplier] = useState(1.5)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    if (leagueSettings) {
      setRoundScores([
        leagueSettings.round_1_score,
        leagueSettings.round_2_score,
        leagueSettings.round_3_score,
        leagueSettings.round_4_score,
        leagueSettings.round_5_score,
        leagueSettings.round_6_score
      ])
      setUpsetMultiplier(leagueSettings.upset_multiplier)
    }
  }, [leagueSettings])

  const handleSave = async () => {
    if (!isCommissioner) return

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('league_settings')
        .update({
          round_1_score: roundScores[0],
          round_2_score: roundScores[1],
          round_3_score: roundScores[2],
          round_4_score: roundScores[3],
          round_5_score: roundScores[4],
          round_6_score: roundScores[5],
          upset_multiplier: upsetMultiplier
        })
        .eq('league_id', leagueId)

      if (error) throw error

      onUpdate()

      toast({
        title: "Success",
        description: "Scoring settings updated successfully.",
      })
    } catch (error) {
      console.error('Error updating scoring settings:', error)
      toast({
        title: "Error",
        description: "Failed to update scoring settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {roundScores.map((score, index) => (
          <div key={index} className="contents">
            <Label htmlFor={`round${index + 1}Score`} className="flex items-center">
              Round {index + 1} Score
            </Label>
            <div>
              <Input
                id={`round${index + 1}Score`}
                type="number"
                min={1}
                value={score}
                onChange={(e) => {
                  const newScores = [...roundScores]
                  newScores[index] = parseInt(e.target.value)
                  setRoundScores(newScores)
                }}
                disabled={!isCommissioner || isLoading}
                className="w-24"
              />
            </div>
          </div>
        ))}
        <Label htmlFor="upsetMultiplier" className="flex items-center">
          Upset Multiplier
        </Label>
        <div>
          <Input
            id="upsetMultiplier"
            type="number"
            min={1}
            step={0.1}
            value={upsetMultiplier}
            onChange={(e) => setUpsetMultiplier(parseFloat(e.target.value))}
            disabled={!isCommissioner || isLoading}
            className="w-24"
          />
        </div>
      </div>
      <Button onClick={handleSave} disabled={!isCommissioner || isLoading} className="mt-4">
        {isLoading ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  )
}


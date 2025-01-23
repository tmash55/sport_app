"use client"

import { useState, useCallback, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface LeagueSettings {
  round_1_score: number
  round_2_score: number
  round_3_score: number
  round_4_score: number
  round_5_score: number
  round_6_score: number
  upset_multiplier: number
}

interface ScoringSettingsProps {
  leagueId: string
  isCommissioner: boolean
  leagueSettings: LeagueSettings[] // Array of LeagueSettings
  onUpdate: (updatedData: Partial<LeagueSettings>) => Promise<void>
}

export function ScoringSettings({ leagueId, isCommissioner, leagueSettings, onUpdate }: ScoringSettingsProps) {
  const [roundScores, setRoundScores] = useState<number[]>([])
  const [upsetMultiplier, setUpsetMultiplier] = useState<number>(1)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Extract the first object from the array
  const settings = leagueSettings.length > 0 ? leagueSettings[0] : null

  useEffect(() => {
    if (settings) {
      setRoundScores([
        settings.round_1_score,
        settings.round_2_score,
        settings.round_3_score,
        settings.round_4_score,
        settings.round_5_score,
        settings.round_6_score,
      ])
      setUpsetMultiplier(settings.upset_multiplier)
    }
  }, [settings])

  const handleSave = useCallback(async () => {
    if (!isCommissioner) return

    setIsLoading(true)
    try {
      const updatedSettings: Partial<LeagueSettings> = {
        round_1_score: roundScores[0],
        round_2_score: roundScores[1],
        round_3_score: roundScores[2],
        round_4_score: roundScores[3],
        round_5_score: roundScores[4],
        round_6_score: roundScores[5],
        upset_multiplier: upsetMultiplier,
      }

      await onUpdate(updatedSettings)

      toast({
        title: "Success",
        description: "Scoring settings updated successfully.",
      })
    } catch (error) {
      console.error("Error updating scoring settings:", error)
      toast({
        title: "Error",
        description: "Failed to update scoring settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [isCommissioner, roundScores, upsetMultiplier, onUpdate, toast])

  if (!settings) {
    return <p className="text-center">No league settings available.</p>
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
                  newScores[index] = Number(e.target.value) || 0
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
            onChange={(e) => {
              const newValue = Number(e.target.value) || 1
              setUpsetMultiplier(newValue)
            }}
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


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
  leagueSettings: LeagueSettings
  onUpdate: (updatedData: Partial<LeagueSettings>) => Promise<void>
}

export function ScoringSettings({ leagueId, isCommissioner, leagueSettings, onUpdate }: ScoringSettingsProps) {
  console.log("ScoringSettings: Initial leagueSettings", leagueSettings)
  console.log("ScoringSettings: leagueSettings", leagueSettings)

  const [roundScores, setRoundScores] = useState<number[]>([])
  const [upsetMultiplier, setUpsetMultiplier] = useState<number>(1)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    console.log("ScoringSettings: leagueSettings updated", leagueSettings)
    setRoundScores([
      leagueSettings.round_1_score,
      leagueSettings.round_2_score,
      leagueSettings.round_3_score,
      leagueSettings.round_4_score,
      leagueSettings.round_5_score,
      leagueSettings.round_6_score,
    ])
    setUpsetMultiplier(leagueSettings.upset_multiplier)
  }, [leagueSettings])

  useEffect(() => {
    console.log("ScoringSettings: Component re-rendered")
    console.log("Current roundScores:", roundScores)
    console.log("Current upsetMultiplier:", upsetMultiplier)
  }, [roundScores, upsetMultiplier])

  const handleSave = useCallback(async () => {
    if (!isCommissioner) return

    console.log("ScoringSettings: handleSave called")
    console.log("Current roundScores:", roundScores)
    console.log("Current upsetMultiplier:", upsetMultiplier)

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

      console.log("ScoringSettings: Updating with", updatedSettings)
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
                  newScores[index] = Number.parseInt(e.target.value, 10)
                  setRoundScores(newScores)
                  console.log(`ScoringSettings: Round ${index + 1} score changed to`, newScores[index])
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
              const newValue = Number.parseFloat(e.target.value)
              setUpsetMultiplier(newValue)
              console.log("ScoringSettings: Upset multiplier changed to", newValue)
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


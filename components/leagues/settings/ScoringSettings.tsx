"use client"

import { useState, useCallback, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { RotateCcw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"

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

const DEFAULT_ROUND_SCORES = [1, 2, 4, 8, 16, 32]
const DEFAULT_UPSET_MULTIPLIER = 1

export function ScoringSettings({ leagueId, isCommissioner, leagueSettings, onUpdate }: ScoringSettingsProps) {
  // Change the roundScores state to store strings instead of numbers
  const [roundScores, setRoundScores] = useState<string[]>([])
  const [upsetMultiplier, setUpsetMultiplier] = useState<number>(1)
  const [upsetMultiplierInput, setUpsetMultiplierInput] = useState<string>("1")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Update the useEffect to convert numbers to strings
  useEffect(() => {
    if (leagueSettings) {
      setRoundScores([
        leagueSettings.round_1_score.toString(),
        leagueSettings.round_2_score.toString(),
        leagueSettings.round_3_score.toString(),
        leagueSettings.round_4_score.toString(),
        leagueSettings.round_5_score.toString(),
        leagueSettings.round_6_score.toString(),
      ])
      setUpsetMultiplier(leagueSettings.upset_multiplier)
      setUpsetMultiplierInput(leagueSettings.upset_multiplier.toString())
    }
  }, [leagueSettings])

  // Update the handleSave function to parse the string values to numbers
  const handleSave = useCallback(async () => {
    if (!isCommissioner) return

    setIsLoading(true)
    try {
      const updatedSettings: Partial<LeagueSettings> = {
        round_1_score: Number.parseInt(roundScores[0], 10) || 0,
        round_2_score: Number.parseInt(roundScores[1], 10) || 0,
        round_3_score: Number.parseInt(roundScores[2], 10) || 0,
        round_4_score: Number.parseInt(roundScores[3], 10) || 0,
        round_5_score: Number.parseInt(roundScores[4], 10) || 0,
        round_6_score: Number.parseInt(roundScores[5], 10) || 0,
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

  // Update the handleResetToDefault function
  const handleResetToDefault = useCallback(() => {
    setRoundScores(DEFAULT_ROUND_SCORES.map((score) => score.toString()))
    setUpsetMultiplier(DEFAULT_UPSET_MULTIPLIER)
    setUpsetMultiplierInput(DEFAULT_UPSET_MULTIPLIER.toString())
    toast({
      title: "Default Values Set",
      description: "Scoring settings have been reset to default values. Don't forget to save your changes.",
    })
  }, [toast])

  // Update the handleRoundScoreChange function
  const handleRoundScoreChange = (index: number, value: string) => {
    const newScores = [...roundScores]
    newScores[index] = value
    setRoundScores(newScores)
  }

  const handleUpsetMultiplierChange = (value: string) => {
    setUpsetMultiplierInput(value)

    // Convert to number for the actual state
    const numValue = value === "" ? 0 : Number.parseFloat(value)
    setUpsetMultiplier(numValue)
  }

  if (!leagueSettings) {
    return <p className="text-center">No league settings available.</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Scoring Settings</h2>
        <Button variant="outline" size="sm" onClick={handleResetToDefault} disabled={!isCommissioner || isLoading}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset to Default
        </Button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSave()
        }}
      >
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Round Scores</CardTitle>
            <CardDescription>
              Set the points awarded to a league member for each of their teams that win in a given round. Higher rounds
              typically award more points to reflect the increasing difficulty.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {roundScores.map((score, index) => (
                <div key={index} className="space-y-2">
                  <label htmlFor={`round${index + 1}Score`} className="text-sm font-medium">
                    Round {index + 1}
                  </label>
                  {/* Update the input type in the render section */}
                  <Input
                    id={`round${index + 1}Score`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={score}
                    onChange={(e) => handleRoundScoreChange(index, e.target.value)}
                    disabled={!isCommissioner || isLoading}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Upset Multiplier</CardTitle>
            <CardDescription>
              Set the multiplier for upset victories. This adds extra points when a lower-seeded team defeats a
              higher-seeded team.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="upsetMultiplier" className="text-sm font-medium">
                  Upset Multiplier
                </label>
                <Input
                  id="upsetMultiplier"
                  type="text"
                  value={upsetMultiplierInput}
                  onChange={(e) => handleUpsetMultiplierChange(e.target.value)}
                  disabled={!isCommissioner || isLoading}
                  className="max-w-[200px]"
                  placeholder="0.0"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Example: If a 12th seed beats a 5th seed (7 seed difference) and the upset multiplier is 1, the team
                earns 7 extra points on top of the round score. With a multiplier of 1.5, they would get 10.5 extra
                points (7 * 1.5). Set to 0 to disable upset bonuses.
              </p>
            </div>
          </CardContent>
        </Card>

        <CardFooter>
          <Button type="submit" disabled={!isCommissioner || isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </form>
    </div>
  )
}


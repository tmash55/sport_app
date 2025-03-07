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
  const [roundScores, setRoundScores] = useState<number[]>([])
  const [upsetMultiplier, setUpsetMultiplier] = useState<number>(1)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (leagueSettings) {
      setRoundScores([
        leagueSettings.round_1_score,
        leagueSettings.round_2_score,
        leagueSettings.round_3_score,
        leagueSettings.round_4_score,
        leagueSettings.round_5_score,
        leagueSettings.round_6_score,
      ])
      setUpsetMultiplier(leagueSettings.upset_multiplier)
    }
  }, [leagueSettings])

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

  const handleResetToDefault = useCallback(() => {
    setRoundScores(DEFAULT_ROUND_SCORES)
    setUpsetMultiplier(DEFAULT_UPSET_MULTIPLIER)
    toast({
      title: "Default Values Set",
      description: "Scoring settings have been reset to default values. Don't forget to save your changes.",
    })
  }, [toast])

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
                  type="number"
                  min={0}
                  step={0.1}
                  value={upsetMultiplier}
                  onChange={(e) => {
                    const newValue = Number(e.target.value) || 1
                    setUpsetMultiplier(newValue)
                  }}
                  disabled={!isCommissioner || isLoading}
                  className="max-w-[200px]"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Example: If a 12th seed beats a 5th seed (7 seed difference) and the upset multiplier is 1, the team
                earns 7 extra points on top of the round score. With a multiplier of 1.5, they would get 10.5 extra
                points (7 * 1.5).
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


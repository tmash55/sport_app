"use client"

import React, { useState, useEffect } from 'react'
import { createClient } from '@/libs/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

interface LeagueScoringSettingsProps {
  leagueId: string
  isCommissioner: boolean
}

interface ScoringSettings {
  round_1_score: number
  round_2_score: number
  round_3_score: number
  round_4_score: number
  round_5_score: number
  round_6_score: number
  upset_multiplier: number
}

export function LeagueScoringSettings({ leagueId, isCommissioner }: LeagueScoringSettingsProps) {
  const [settings, setSettings] = useState<ScoringSettings>({
    round_1_score: 1,
    round_2_score: 2,
    round_3_score: 3,
    round_4_score: 4,
    round_5_score: 5,
    round_6_score: 6,
    upset_multiplier: 1.00,
  })
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('league_settings')
        .select('*')
        .eq('league_id', leagueId)
        .single()

      if (error) {
        console.error('Error fetching league settings:', error)
        toast({
          title: 'Error',
          description: 'Failed to load league settings. Please try again.',
          variant: 'destructive',
        })
      } else if (data) {
        setSettings(data)
      }
      setIsLoading(false)
    }

    fetchSettings()
  }, [leagueId, supabase, toast])

  const handleInputChange = (field: keyof ScoringSettings, value: string) => {
    setSettings(prev => ({ ...prev, [field]: field === 'upset_multiplier' ? parseFloat(value) : parseInt(value) || 0 }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isCommissioner) return

    setIsLoading(true)
    const { error } = await supabase
      .from('league_settings')
      .update(settings)
      .eq('league_id', leagueId)

    if (error) {
      console.error('Error updating league settings:', error)
      toast({
        title: 'Error',
        description: 'Failed to update league settings. Please try again.',
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Success',
        description: 'League settings updated successfully.',
      })
    }
    setIsLoading(false)
  }

  if (isLoading) {
    return <div className="text-center">Loading settings...</div>
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">League Scoring Settings</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(settings)
              .filter(([field]) => field.includes('score') || field === 'upset_multiplier')
              .map(([field, value]) => (
                <div key={field} className="flex flex-col space-y-2">
                  <Label htmlFor={field} className="text-sm font-medium">
                    {field.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </Label>
                  <Input
                    id={field}
                    type="number"
                    value={value}
                    onChange={(e) => handleInputChange(field as keyof ScoringSettings, e.target.value)}
                    disabled={!isCommissioner}
                    className="w-full"
                    step={field === 'upset_multiplier' ? '0.01' : '1'}
                  />
                </div>
              ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={!isCommissioner || isLoading}>
            {isLoading ? 'Updating...' : 'Update Settings'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}


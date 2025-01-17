"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import AuthForm from '@/components/Auth/AuthForm'
import { createClient } from "@/libs/supabase/client"
import { createLeague } from '@/app/actions/createLeague'

interface PoolDetailsFormProps {
  contestId: string;
  contestName: string;
}

export function PoolDetailsForm({ contestId, contestName }: PoolDetailsFormProps) {
  const [leagueName, setLeagueName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showAuthForm, setShowAuthForm] = useState(false)
  const [authType, setAuthType] = useState<'signin' | 'signup'>('signup')
  const [contestDetails, setContestDetails] = useState<{ name: string, contest_type: string, sport: string } | null>({
    name: contestName,
    contest_type: '',
    sport: ''
  })
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    const fetchContestDetails = async () => {
      console.log('Fetching contest details for ID:', contestId)
      const { data, error } = await supabase
        .from("contests")
        .select("contest_type, sport")
        .eq("id", contestId)
        .single()

      if (error) {
        console.error('Error fetching contest details:', error)
        toast({
          title: "Error",
          description: "Failed to fetch contest details. Please try again.",
          variant: "destructive",
        })
      } else if (data) {
        console.log('Contest details fetched:', data)
        setContestDetails(prevDetails => ({ ...prevDetails, ...data }))
      }
    }

    fetchContestDetails()
    checkAuthStatus()
  }, [contestId, supabase, toast])

  const checkAuthStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setIsAuthenticated(!!user)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (!isAuthenticated) {
        setShowAuthForm(true)
        return
      }

      console.log('Handling form submission')
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError) {
        console.error('User authentication error:', userError)
        throw new Error("User not authenticated")
      }

      if (user) {
        console.log('User authenticated, creating league')
        const result = await createLeague(leagueName, contestId)
        if ('error' in result) {
          console.error('Error from createLeague:', result.error)
          throw new Error(result.error)
        }
        console.log('League created successfully:', result)
        router.push(`/dashboard/leagues/${result.leagueId}`)
      } else {
        console.log('User not authenticated, showing auth form')
        setShowAuthForm(true)
        setAuthType('signup')
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAuthSuccess = async (userId: string) => {
    console.log('Auth success, creating league for user:', userId)
    setShowAuthForm(false)
    setIsAuthenticated(true)
    const result = await createLeague(leagueName, contestId)
    if ('error' in result) {
      console.error('Error creating league after auth:', result.error)
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    } else {
      console.log('League created successfully after auth:', result)
      router.push(`/dashboard/leagues/${result.leagueId}`)
    }
  }

  if (showAuthForm) {
    return (
      <div className="max-w-md mx-auto">
        <AuthForm type={authType} onSuccess={handleAuthSuccess} />
        <div className="mt-4 text-center">
          {authType === 'signup' ? (
            <p>
              Already have an account?{' '}
              <Button variant="link" onClick={() => setAuthType('signin')}>
                Sign in
              </Button>
            </p>
          ) : (
            <p>
              Don't have an account?{' '}
              <Button variant="link" onClick={() => setAuthType('signup')}>
                Sign up
              </Button>
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>League Details</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="space-y-4">
            {contestDetails && (
              <div>
                <p>Contest: {contestDetails.name}</p>
                <p>Type: {contestDetails.contest_type}</p>
                <p>Sport: {contestDetails.sport}</p>
              </div>
            )}
            <div>
              <Label htmlFor="leagueName">League Name</Label>
              <Input
                id="leagueName"
                value={leagueName}
                onChange={(e) => setLeagueName(e.target.value)}
                placeholder="My March Madness League"
                required
                minLength={3}
                maxLength={50}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              You'll be able to adjust more settings once the league is created.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
            Back
          </Button>
          <Button type="submit" disabled={isLoading || leagueName.length < 3}>
            {isLoading ? "Creating..." : isAuthenticated ? "Create League" : "Sign Up and Create League"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}


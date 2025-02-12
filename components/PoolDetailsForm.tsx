"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import AuthForm from "@/components/Auth/AuthForm"
import { createClient } from "@/libs/supabase/client"
import { createLeague } from "@/app/actions/createLeague"
import { Trophy, Users } from "lucide-react"

interface PoolDetailsFormProps {
  contestId: string
  contestName: string
}

export function PoolDetailsForm({ contestId, contestName }: PoolDetailsFormProps) {
  const [leagueName, setLeagueName] = useState("")
  const [maxTeams, setMaxTeams] = useState("8")
  const [isLoading, setIsLoading] = useState(false)
  const [showAuthForm, setShowAuthForm] = useState(false)
  const [authType, setAuthType] = useState<"signin" | "signup">("signup")
  const [contestDetails, setContestDetails] = useState<{ name: string; contest_type: string; sport: string } | null>({
    name: contestName,
    contest_type: "",
    sport: "",
  })
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    const fetchContestDetails = async () => {
      const { data, error } = await supabase.from("contests").select("contest_type, sport").eq("id", contestId).single()

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch contest details. Please try again.",
          variant: "destructive",
        })
      } else if (data) {
        setContestDetails((prevDetails) => ({ ...prevDetails, ...data }))
      }
    }

    fetchContestDetails()
    checkAuthStatus()
  }, [contestId, supabase, toast])

  const checkAuthStatus = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
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

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        throw new Error("User not authenticated")
      }

      if (user) {
        const result = await createLeague(leagueName, contestId, Number.parseInt(maxTeams))
        if ("error" in result) {
          throw new Error(result.error)
        }
        router.push(`/dashboard/leagues/${result.leagueId}`)
      } else {
        setShowAuthForm(true)
        setAuthType("signup")
      }
    } catch (error) {
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
    setShowAuthForm(false)
    setIsAuthenticated(true)
    const result = await createLeague(leagueName, contestId, Number.parseInt(maxTeams))
    if ("error" in result) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    } else {
      router.push(`/dashboard/leagues/${result.leagueId}`)
    }
  }

  if (showAuthForm) {
    return (
      <div className="max-w-md mx-auto">
        <AuthForm type={authType} onSuccess={handleAuthSuccess} />
        <div className="mt-4 text-center">
          {authType === "signup" ? (
            <p>
              Already have an account?{" "}
              <Button variant="link" onClick={() => setAuthType("signin")}>
                Sign in
              </Button>
            </p>
          ) : (
            <p>
              Don&apos;t have an account?{" "}
              <Button variant="link" onClick={() => setAuthType("signup")}>
                Sign up
              </Button>
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <Card className="max-w-2xl mx-auto bg-card/50 backdrop-blur">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="grid gap-4 p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              <span className="font-medium">Contest:</span>
              <span>{contestDetails?.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="font-medium">Sport:</span>
              <span>{contestDetails?.sport.toUpperCase()}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="leagueName">League Name</Label>
                <Input
                  id="leagueName"
                  value={leagueName}
                  onChange={(e) => setLeagueName(e.target.value)}
                  placeholder="My March Madness Pool"
                  required
                  minLength={3}
                  maxLength={50}
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxTeams">Number of Teams</Label>
                <Select value={maxTeams} onValueChange={setMaxTeams}>
                  <SelectTrigger id="maxTeams" className="bg-background">
                    <SelectValue placeholder="Select number of teams" />
                  </SelectTrigger>
                  <SelectContent>
                    {[4, 6, 8, 10, 12].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} Teams
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="pt-4">
              <p className="text-sm text-muted-foreground mb-6">
                You&apos;ll be able to adjust more settings once the pool is created.
              </p>
              <Button type="submit" disabled={isLoading || leagueName.length < 3} className="w-full">
                {isLoading ? "Creating..." : isAuthenticated ? "Create Pool" : "Sign Up and Create Pool"}
              </Button>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}


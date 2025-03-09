"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import AuthForm from "@/components/Auth/AuthForm"
import { createClient } from "@/libs/supabase/client"
import { createLeague } from "@/app/actions/createLeague"
import { Info } from "lucide-react"
import { createNFLDraftLeague } from "@/app/actions/createNFLDraftleague"
import { Alert, AlertDescription } from "@/components/ui/alert"

const NFL_DRAFT_CONTEST_ID = "d282f9e8-4b9c-4218-a270-215c635a7e29"

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
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const isNFLDraft = contestId === NFL_DRAFT_CONTEST_ID

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setIsAuthenticated(!!user)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    // Prevent multiple clicks
    if (isLoading) return;
  
    setIsLoading(true);
  
    try {
      if (!isAuthenticated) {
        setShowAuthForm(true);
        return;
      }
  
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
  
      if (userError || !user) {
        throw new Error("User not authenticated");
      }
  
      let result;
      if (isNFLDraft) {
        result = await createNFLDraftLeague(leagueName, contestId);
      } else {
        result = await createLeague(leagueName, contestId, Number.parseInt(maxTeams));
      }
  
      if ("error" in result) {
        throw new Error(result.error);
      }
  
      // Redirect and **only then** reset loading state
      router.push(
        isNFLDraft
          ? `/dashboard/pools/nfl-draft/${result.leagueId}`
          : `/dashboard/pools/march-madness-draft/${result.leagueId}`
      );
  
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
      setIsLoading(false); // Reset only on error
    }
  };
  

  if (showAuthForm) {
    return (
      <div className="max-w-md mx-auto">
        <AuthForm type={authType} onSuccess={() => setShowAuthForm(false)} />
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
    <div className="max-w-2xl mx-auto">
      <Card className="backdrop-blur">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Input
                  id="leagueName"
                  value={leagueName}
                  onChange={(e) => setLeagueName(e.target.value)}
                  placeholder="Enter pool name"
                  required
                  minLength={3}
                  maxLength={50}
                  className="text-lg py-6"
                />
              </div>

              {!isNFLDraft && (
                <div>
                  <Select value={maxTeams} onValueChange={setMaxTeams}>
                    <SelectTrigger className="w-full text-lg py-6">
                      <SelectValue placeholder="Select number of members" />
                    </SelectTrigger>
                    <SelectContent>
                      {[4, 6, 8, 10, 12].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} Members
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <Alert variant="default" className="bg-card">
              <Info className="h-4 w-4" />
              <AlertDescription>
                {isNFLDraft ? (
                  <>
                    Create your entries for free! A one-time service fee will be due when the NFL Draft starts.{" "}
                    <Link href="/pricing" className="font-medium underline hover:text-primary">
                      View pricing details
                    </Link>
                  </>
                ) : (
                  <>
                    No upfront cost - invite friends and draft your teams! A one-time service fee will be due after
                    draft completion.{" "}
                    <Link href="/pricing" className="font-medium underline hover:text-primary">
                      View pricing details
                    </Link>
                  </>
                )}
              </AlertDescription>
            </Alert>

            <Button
              type="submit"
              disabled={isLoading || leagueName.length < 3}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-6 text-lg font-medium"
            >
              {isLoading ? "Creating..." : "Create Pool"}
            </Button>

            <p className="text-sm text-muted-foreground text-center">
              Additional pool settings will be available after creation
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


"use client"

import React, { useState, useCallback, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import toast from "react-hot-toast"
import { createClient } from '@/libs/supabase/client'
import { useRouter } from 'next/navigation'


interface InvitePageAuthProps {
  leagueId: string
  leagueName: string
}

export function InvitePageAuth({leagueName }: InvitePageAuthProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [authType, setAuthType] = useState<"signin" | "signup">("signin")

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    if (authType !== "signup" || !password) {
      setPasswordStrength(0)
      return
    }

    // Simple password strength calculation
    let strength = 0

    // Length check
    if (password.length >= 8) strength += 25
    if (password.length >= 12) strength += 15
    if (password.length >= 16) strength += 10

    // Character variety checks (optional but helpful)
    if (/[A-Z]/.test(password)) strength += 10 // Has uppercase
    if (/[0-9]/.test(password)) strength += 10 // Has number
    if (/[^A-Za-z0-9]/.test(password)) strength += 15 // Has special char
    if (password.length > 20) strength += 15 // Extra length bonus

    // Cap at 100
    setPasswordStrength(Math.min(100, strength))
  }, [password, authType])

  // Get strength label and color
  const getStrengthInfo = () => {
    if (passwordStrength < 30) return { label: "Weak", color: "bg-red-500" }
    if (passwordStrength < 60) return { label: "Fair", color: "bg-yellow-500" }
    if (passwordStrength < 80) return { label: "Good", color: "bg-blue-500" }
    return { label: "Strong", color: "bg-green-500" }
  }

  const strengthInfo = getStrengthInfo()

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Basic password validation for signup
      if (authType === "signup") {
        if (password.length < 8) {
          setError("Password must be at least 8 characters long.")
          setIsLoading(false)
          return
        }

        // Check if the username is already taken
        const { data: existingUser, error: checkError } = await supabase
          .from("users")
          .select("id")
          .eq("display_name", username)
          .single()

        if (existingUser) {
          setError("This username is already taken. Please choose another.")
          setIsLoading(false)
          return
        }

        // Proceed with signup
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: username } },
        })

        if (error) {
          throw error
        }
        if (!data.user) {
          throw new Error("An error occurred while creating your account. Please try again.")
        }

        toast.success("Signed up successfully!")
        router.refresh()
      } else {
        // Handle sign-in
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        toast.success("Signed in successfully!")
        router.refresh()
      }
    } catch (error: any) {
      console.error("Authentication error:", error)

      // Handle specific username error message
      if (error.message.includes("Database error saving new user")) {
        setError("This username is already taken.")
      } else {
        setError(error.message || "An unexpected error occurred. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
      })
      if (error) throw error
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          {authType === "signup" ? "Create an account" : "Sign in"}
        </CardTitle>
        <CardDescription>
          {authType === "signup"
            ? `Enter your details below to create your account and join ${leagueName}`
            : `Enter your email below to sign in to your account and join ${leagueName}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {authType === "signup" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter a unique username (min 3 characters)"
                  onChange={(e) => setUsername(e.target.value)}
                  value={username}
                  required
                  minLength={3}
                />

              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </>
          )}
          {authType === "signin" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading
              ? "Loading..."
              : authType === "signup"
              ? "Sign up"
              : "Sign in"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="relative w-full">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-muted-foreground" />
          </div>
          
        </div>
        
        <div className="text-center text-sm">
          {authType === "signin" ? (
            <p>
              Don&apos;t have an account?{" "}
              <Button variant="link" className="p-0" onClick={() => setAuthType("signup")}>
                Sign up
              </Button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <Button variant="link" className="p-0" onClick={() => setAuthType("signin")}>
                Sign in
              </Button>
            </p>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}

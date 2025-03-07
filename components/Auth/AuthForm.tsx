"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createClient } from "@/libs/supabase/client"
import type { Provider } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import toast from "react-hot-toast"
import Link from "next/link"
import { InfoIcon, Eye, EyeOff } from "lucide-react"

type AuthFormProps = {
  type: "signin" | "signup"
  onSuccess: (userId: string) => void
}

export default function AuthForm({ type, onSuccess }: AuthFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const supabase = createClient()

  // Calculate password strength
  useEffect(() => {
    if (type !== "signup" || !password) {
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
  }, [password, type])

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
      if (type === "signup") {
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
        onSuccess(data.user.id)
      } else {
        // Handle sign-in
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        toast.success("Signed in successfully!")
        onSuccess(data.user.id)
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

  const handleOAuthSignIn = async (provider: Provider) => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({ provider })
      if (error) throw error
      if (data.url) window.location.href = data.url
    } catch (error) {
      console.error("OAuth sign-in error:", error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{type === "signup" ? "Create an account" : "Sign in"}</CardTitle>
        <CardDescription>
          {type === "signup"
            ? `Enter your details below to create your account`
            : `Enter your email below to sign in to your account`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {type === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter a unique username (min 3 characters)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
              />
            </div>
          )}
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
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Password</Label>
              {type === "signup" && password && (
                <span className="text-xs font-medium" style={{ color: strengthInfo.color }}>
                  {strengthInfo.label}
                </span>
              )}
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={type === "signup" ? 8 : undefined}
                maxLength={128} // Allow very long passwords
                className="pr-10" // Make room for the eye icon
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-foreground"
                onClick={togglePasswordVisibility}
                tabIndex={-1} // Skip in tab order
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
                <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
              </Button>
            </div>

            {type === "signup" && (
              <>
                {password && <Progress value={passwordStrength} className={`h-1 mt-1 ${strengthInfo.color}`} />}
               
              </>
            )}
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Loading..." : type === "signup" ? "Sign up" : "Sign in"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          {type === "signup" ? (
            <>
              Already have an account?{" "}
              <Link href="/sign-in" className="text-primary hover:underline">
                Sign in
              </Link>
            </>
          ) : (
            <>
              Don&apos;t have an account?{" "}
              <Link href="/sign-up" className="text-primary hover:underline">
                Sign up
              </Link>
            </>
          )}
        </p>
      </CardFooter>
    </Card>
  )
}


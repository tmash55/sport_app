import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import crypto from "crypto"
import { sendPasswordResetEmail } from "@/lib/email"

export async function POST(request: Request) {
  const cookieStore = cookies()

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: "", ...options })
          },
        },
      },
    )

    // Get the email from the request body
    const { email } = await request.json()

    // Check if the user exists
    const { data: user, error: userError } = await supabase.from("users").select("id").eq("email", email).single()

    if (userError || !user) {
      // Don't reveal if the email exists or not for security reasons
      return NextResponse.json({ message: "If an account with that email exists, we have sent a password reset link." })
    }

    // Generate a unique token
    const token = crypto.randomBytes(32).toString("hex")

    // Set expiration to 1 hour from now
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1)

    // Insert the reset token into the database
    // Note: You might need to create a 'password_reset_tokens' table in your database
    const { error: tokenError } = await supabase.from("password_reset_tokens").insert({
      user_id: user.id,
      token,
      expires_at: expiresAt.toISOString(),
    })

    if (tokenError) {
      console.error("Error creating reset token:", tokenError)
      return NextResponse.json({ error: "Failed to create reset token" }, { status: 500 })
    }

    // Generate reset link
    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`

    // Send email using sendPasswordResetEmail function
    try {
      console.log("Attempting to send password reset email to:", email, "with reset link:", resetLink)
      await sendPasswordResetEmail(email, resetLink)
      console.log("Password reset email sent successfully")
    } catch (emailError) {
      console.error("Error sending password reset email:", JSON.stringify(emailError, null, 2))
      return NextResponse.json({
        message: "If an account with that email exists, we have sent a password reset link.",
        warning: "Email could not be sent. Please try again or contact support.",
      })
    }

    return NextResponse.json({ message: "If an account with that email exists, we have sent a password reset link." })
  } catch (error) {
    console.error("Unexpected error:", error instanceof Error ? error.message : error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}


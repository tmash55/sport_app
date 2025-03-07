import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/libs/supabase/server"
import { createCheckout } from "@/libs/stripe"

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const body = await req.json()
    const { priceId, successUrl, cancelUrl, mode, metadata } = body
    const leagueId = metadata?.leagueId

    // Validate input
    if (!leagueId) {
      return NextResponse.json({ error: "League ID is required." }, { status: 400 })
    }

    // Get user session
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "You must be logged in to create a payment session." }, { status: 401 })
    }

    // Check if the league exists and get commissioner ID
    const { data: league, error: leagueError } = await supabase
      .from("leagues")
      .select("commissioner_id, payment_status")
      .eq("id", leagueId)
      .single()

    if (leagueError || !league) {
      return NextResponse.json({ error: "League not found." }, { status: 404 })
    }

    // Ensure the user is the commissioner
    if (league.commissioner_id !== user.id) {
      return NextResponse.json({ error: "Only the commissioner can pay." }, { status: 403 })
    }

    // Ensure payment is required
    if (league.payment_status === "paid") {
      return NextResponse.json({ message: "League is already unlocked." })
    }



    // Get user's Stripe customer ID
    const { data: userProfile } = await supabase
      .from("users")
      .select("email, stripe_customer_id")
      .eq("id", user.id)
      .single()

    // Create Stripe Checkout Session
    const stripeSessionURL = await createCheckout({
      priceId: priceId || process.env.STRIPE_PRICE_ID!, // Use provided priceId or fallback to env variable
      mode: mode || "payment",
      successUrl:
        successUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/pools/march-madness-draft/${leagueId}?payment_success=true`,
      cancelUrl:
        cancelUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/pools/march-madness-draft/${leagueId}?payment_cancelled=true`,
      clientReferenceId: leagueId,
      metadata: { ...metadata, leagueId }, // Include all metadata
      user: {
        email: userProfile?.email,
        customerId: userProfile?.stripe_customer_id,
      },
    })

    return NextResponse.json({ url: stripeSessionURL })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}


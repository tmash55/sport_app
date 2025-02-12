import { createClient } from "@/libs/supabase/server"
import { findCheckoutSession } from "@/libs/stripe"
import { headers } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-08-16",
  typescript: true,
})
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = headers().get("stripe-signature")

  let event
  try {
    event = stripe.webhooks.constructEvent(body, signature!, webhookSecret)
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  // Create a Supabase client using the server-side method
  const supabase = createClient()

  try {
    if (event.type === "checkout.session.completed") {
      const stripeObject = event.data.object as Stripe.Checkout.Session

      // Get session details
      const session = await findCheckoutSession(stripeObject.id)
      const stripe_customer_id = session?.customer // Customer ID from Stripe
      const stripe_session_id = stripeObject.id // Session ID
      const league_id = stripeObject.client_reference_id // League ID from Stripe checkout session

      // Get commissioner ID from leagues table
      const { data: league } = await supabase.from("leagues").select("commissioner_id").eq("id", league_id).single()

      if (!league) {
        console.error("League not found for Stripe session.")
        return NextResponse.json({ error: "League not found." }, { status: 404 })
      }

      const commissioner_id = league.commissioner_id

      // Store stripe_customer_id and stripe_session_id in users
      await supabase.from("users").update({ stripe_customer_id, stripe_session_id }).eq("id", commissioner_id)

      // Unlock the league (update payment_status = 'paid')
      await supabase.from("leagues").update({ payment_status: "paid" }).eq("id", league_id)

      console.log(`✅ League ${league_id} unlocked. Payment received from User ${commissioner_id}`)
    }
  } catch (e: any) {
    console.error("Stripe webhook error:", e.message)
  }

  return NextResponse.json({ received: true })
}


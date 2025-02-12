import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@/libs/supabase/server";
import { createCustomerPortal } from "@/libs/stripe";

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in to view billing information." },
        { status: 401 }
      );
    }

    // Get the user's Stripe customer ID
    const { data: userProfile } = await supabase
      .from("users")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (!userProfile?.stripe_customer_id) {
      return NextResponse.json(
        { error: "You don't have a billing account yet. Make a purchase first." },
        { status: 400 }
      );
    }

    // Create Stripe customer portal session
    const stripePortalUrl = await createCustomerPortal({
      customerId: userProfile.stripe_customer_id,
      returnUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
    });

    return NextResponse.json({ url: stripePortalUrl });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}

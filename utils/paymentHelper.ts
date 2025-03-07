import { createClient } from "@/libs/supabase/client"

export async function getUserPaidLeagues(userId: string, contestId: string) {
  if (!userId || !contestId) {
    console.error("Invalid userId or contestId", { userId, contestId })
    throw new Error("Invalid userId or contestId")
  }

  const supabase = createClient()

  // Fetch leagues where the user is the commissioner & has paid & same contest
  const { data, error } = await supabase
    .from("leagues")
    .select("id")
    .eq("commissioner_id", userId)
    .eq("payment_status", "paid")
    .eq("contest_id", contestId)

  if (error) {
    //console.error("Error fetching paid leagues:", error)
    throw error
  }

  //console.log(`Paid leagues for user ${userId} in contest ${contestId}:`, data)
  return data.length
}

// Function to determine the correct price index based on the count
export function getPriceIndexForUser(paidLeagues: number): number {
  //console.log(`Determining price index for ${paidLeagues} paid leagues`)

  if (paidLeagues === 0) {
    //console.log("First pool - $30")
    return 0 // PoolPass
  } else if (paidLeagues >= 1 && paidLeagues <= 5) {
    //console.log("2-5 pools - $25")
    return 1 // PoolPass2-5
  } else {
    //console.log("6+ pools - $20")
    return 2 // PoolPass6+
  }
}


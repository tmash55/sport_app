import { createClient } from "@/libs/supabase/server"
import { DraftRoom } from "@/components/leagues/DraftRoom"
import { notFound } from "next/navigation"

export default async function LeagueDraftPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  // Fetch league details to ensure the league exists
  const { data: league, error } = await supabase
    .from("leagues")
    .select("*")
    .eq("id", params.id)
    .single()

  if (error || !league) {
    notFound()
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">{league.name} - Draft Room</h1>
      <DraftRoom leagueId={params.id} />
    </div>
  )
}


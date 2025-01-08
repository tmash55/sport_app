import { createClient } from "@/libs/supabase/server";
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function LeaguesPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: leagues, error } = await supabase
    .from('leagues')
    .select('*')
    .eq('commissioner_id', user?.id)

  if (error) {
    console.error('Error fetching leagues:', error)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Leagues</h1>
        <Button asChild>
          <Link href="/dashboard/leagues/create">Create New League</Link>
        </Button>
      </div>
      {leagues && leagues.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {leagues.map((league) => (
            <Card key={league.id}>
              <CardHeader>
                <CardTitle>{league.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Teams: {league.max_teams}</p>
                <Button asChild className="mt-4">
                  <Link href={`/dashboard/leagues/${league.id}`}>View League</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p>You haven't created any leagues yet.</p>
      )}
    </div>
  )
}


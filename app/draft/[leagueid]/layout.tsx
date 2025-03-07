import { createClient } from "@/libs/supabase/server"
import type React from "react"
import { redirect } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lock, Calendar, UserPlus, Settings } from "lucide-react"
import Link from "next/link"
import { UserProvider } from "@/app/context/UserProvider"


export default async function DraftLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { leagueid: string }
}) {
  const supabase = createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/sign-in")
  }

  // Check if the user is a member of the league
  const { data: leagueMember, error: leagueMemberError } = await supabase
    .from("league_members")
    .select("id")
    .eq("league_id", params.leagueid)
    .eq("user_id", user.id)
    .single()

  if (leagueMemberError || !leagueMember) {
    redirect("/dashboard")
  }

  // Get Draft Room Status from Environment Variable
  const draftRoomStatus = process.env.DRAFT_ROOM_STATUS
  // Log the value for debugging
  console.log("Draft Room Status:", draftRoomStatus)
  if (draftRoomStatus === "locked") {
    return (
      <UserProvider>
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
            <Lock className="text-primary w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold text-primary">Hang Tight, Hoops Fans!</CardTitle>
          <CardDescription>
            Our draft room is taking a timeout while we wait for the big dance lineup.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg flex items-center space-x-4">
            <Calendar className="text-muted-foreground" />
            <div>
              <p className="font-medium">The Madness is Coming</p>
              <p className="text-sm text-muted-foreground">
                Draft rooms will open after Selection Sunday on March 16th
              </p>
            </div>
          </div>
          <p className="text-sm text-center font-medium">In the meantime, why not:</p>
          <div className="space-y-2">
            <div className="bg-muted p-3 rounded-lg flex items-center space-x-3">
              <UserPlus className="text-muted-foreground h-5 w-5" />
              <p className="text-sm">Invite your friends to join the madness</p>
            </div>
            <div className="bg-muted p-3 rounded-lg flex items-center space-x-3">
              <Settings className="text-muted-foreground h-5 w-5" />
              <p className="text-sm">Tweak your league&apos;s scoring settings</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button asChild className="w-full">
            <Link href={`/dashboard/pools/march-madness-draft/${params.leagueid}`}>Manage League</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
    </UserProvider>
    )
  }

  return <UserProvider><div className="min-h-screen bg-background">{children}</div></UserProvider>
}


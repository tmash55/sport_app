import { Bracket } from "@/components/bracket/Bracket"
import { BracketHeader } from "@/components/bracket/BracketHeader"
import { EmptyBracket } from "@/components/bracket/EmptyBracket"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar, Lock, Trophy, Users, ArrowLeft } from "lucide-react"

export default function BracketPage() {
  // Get Bracket Status from Environment Variable
  const bracketStatus = process.env.BRACKET_STATUS
  const bracketPreview = process.env.BRACKET_PREVIEW === "true"

  // If bracket is not yet available, show locked state
  if (bracketStatus === "locked") {
    return (
      <div className="flex min-h-screen w-full flex-col bg-background">
        <div className="flex-1 overflow-hidden">
          <BracketHeader />
          <div className="h-[calc(100vh-8rem)] flex items-center justify-center p-4">
            <Card className="max-w-md w-full">
              <CardHeader className="text-center">
                <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Lock className="text-primary w-6 h-6" />
                </div>
                <CardTitle className="text-2xl font-bold text-primary">Bracket Coming Soon!</CardTitle>
                <CardDescription>The official tournament bracket hasn&apos;t been announced yet.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-4 rounded-lg flex items-center space-x-4">
                  <Calendar className="text-muted-foreground" />
                  <div>
                    <p className="font-medium">Selection Sunday</p>
                    <p className="text-sm text-muted-foreground">
                      The bracket will be available after March 16th when all teams are selected
                    </p>
                  </div>
                </div>
                <p className="text-sm text-center font-medium">While you wait:</p>
                <div className="space-y-2">
                  <div className="bg-muted p-3 rounded-lg flex items-center space-x-3">
                    <Users className="text-muted-foreground h-5 w-5" />
                    <p className="text-sm">Invite friends to join your league</p>
                  </div>
                  <div className="bg-muted p-3 rounded-lg flex items-center space-x-3">
                    <Trophy className="text-muted-foreground h-5 w-5" />
                    <p className="text-sm">Review your league&apos;s scoring settings</p>
                  </div>
                </div>
              </CardContent>
             
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // If bracket is in preview mode, show the empty bracket
  if (bracketPreview) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-background">
        <div className="flex-1 overflow-hidden">
          <div className="h-full">
            <BracketHeader />
            <div className="scrollbar-none h-[calc(100vh-8rem)] overflow-auto px-4 py-2">
              <EmptyBracket />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // If bracket is available, show the bracket
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <div className="flex-1 overflow-hidden">
        <div className="h-full">
          <BracketHeader />
          <div className="scrollbar-none h-[calc(100vh-8rem)] overflow-auto px-4 py-2">
            <Bracket />
          </div>
        </div>
      </div>
    </div>
  )
}


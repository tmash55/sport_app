"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, Check, Users } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { StepIndicator } from '../StepIndicator'

interface InviteMembersProps {
  leagueId: string
  leagueName: string
}

export function InviteMembers2({ leagueId, leagueName }: InviteMembersProps) {
  const [copied, setCopied] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const inviteLink = `${window.location.origin}/leagues/join/${leagueId}`

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      toast({
        title: "Link copied!",
        description: "Share it with your friends to invite them to your league.",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again or copy the link manually.",
        variant: "destructive",
      })
    }
  }

  const skipInvite = () => {
    router.push(`/leagues/${leagueId}`)
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <StepIndicator steps={["Select Contest", "League Details", "Invite Friends"]} currentStep={3} />
        <div className="space-y-2">
          <h2 className="text-2xl font-bold mb-4">Invite Members to {leagueName}</h2>
          <CardTitle className="text-3xl font-bold tracking-tight">Invite League Members</CardTitle>
          <CardDescription className="text-xl">
            Get your friends together for {leagueName}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="text-center space-y-2">
          <Users className="w-12 h-12 mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">
            Invite members to make your league more competitive and fun.
            We recommend having at least 6-8 members for the best experience.
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="relative">
            <Button
              className="w-full h-16 text-lg font-medium transition-all duration-200 ease-in-out"
              onClick={copyLink}
              variant={copied ? "secondary" : "default"}
            >
              <span className="flex items-center gap-2">
                {copied ? (
                  <>
                    <Check className="w-5 h-5" />
                    Copied to clipboard!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copy Invite Link
                  </>
                )}
              </span>
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button
          variant="ghost"
          className="text-muted-foreground hover:text-primary"
          onClick={skipInvite}
        >
          Skip for now
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          You can always invite more members later from your league settings
        </p>
      </CardFooter>
    </Card>
  )
}


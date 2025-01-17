"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { createClient } from "@/libs/supabase/client"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { InviteMembers } from "@/components/leagues/InviteMembers"

interface LeagueMember {
  id: string
  user_id: string
  draft_position: number | null
  team_name: string
  users: {
    display_name: string | null
    email: string
  }
}

interface LeagueSettings {
  max_teams: number
  round_1_score: number
  round_2_score: number
  round_3_score: number
  round_4_score: number
  round_5_score: number
  round_6_score: number
  upset_multiplier: number
}

interface LeagueDraftProps {
  leagueId: string
  isCommissioner: boolean
}

export function LeagueDraft({ leagueId, isCommissioner }: LeagueDraftProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isDraftOrderSet, setIsDraftOrderSet] = useState(false)
  const [draftStatus, setDraftStatus] = useState<string | null>(null)
  const [leagueMembers, setLeagueMembers] = useState<LeagueMember[]>([])
  const [leagueSettings, setLeagueSettings] = useState<LeagueSettings | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchLeagueData = async () => {
      setIsLoading(true)
      try {
        // Fetch league members and their draft positions
        const { data: members, error: membersError } = await supabase
          .from('league_members')
          .select(`
            id,
            user_id,
            draft_position,
            team_name,
            users (
              display_name,
              email
            )
          `)
          .eq('league_id', leagueId)
          .order('draft_position', { ascending: true, nullsLast: true })

        if (membersError) throw membersError
        setLeagueMembers(members)

        // Check if all members have a draft position
        const allMembersHaveDraftPosition = members.every(member => member.draft_position !== null)
        setIsDraftOrderSet(allMembersHaveDraftPosition)

        // Fetch draft status
        const { data: draft, error: draftError } = await supabase
          .from('drafts')
          .select('status')
          .eq('league_id', leagueId)
          .single()

        if (draftError && draftError.code !== 'PGRST116') throw draftError
        setDraftStatus(draft?.status || null)

        // Fetch league settings
        const { data: settings, error: settingsError } = await supabase
          .from('league_settings')
          .select('*')
          .eq('league_id', leagueId)
          .single()

        if (settingsError) throw settingsError
        setLeagueSettings(settings)

      } catch (error) {
        console.error('Error fetching league data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeagueData()
  }, [leagueId, supabase])

  const handleButtonClick = () => {
    if (isDraftOrderSet) {
      router.push(`/draft/${leagueId}`)
    } else if (isCommissioner) {
      router.push(`/leagues/${leagueId}/set-draft-order`)
    }
  }

  const getButtonText = () => {
    if (!isDraftOrderSet && isCommissioner) return "Set Draft Order"
    if (draftStatus === 'completed') return "View Draft Results"
    return "Enter Draft Room"
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle><Skeleton className="h-6 w-32" /></CardTitle>
          <CardDescription><Skeleton className="h-4 w-64" /></CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-4" />
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
    )
  }

  const isLeagueFull = leagueMembers.every(member => member.user_id !== null)


  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>League Draft</CardTitle>
        <CardDescription>
          {isDraftOrderSet
            ? "The draft order has been set. Prepare for the upcoming draft or join an ongoing one."
            : "The draft order needs to be set before the draft can begin."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isLeagueFull && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Invite Members</h3>
            <InviteMembers leagueId={leagueId} />
          </div>
        )}

        <div className="space-y-4">
          <Button 
            onClick={handleButtonClick}
            disabled={!isDraftOrderSet && !isCommissioner}
          >
            {getButtonText()}
          </Button>
          {!isDraftOrderSet && !isCommissioner && (
            <p className="text-sm text-muted-foreground">
              The commissioner needs to set the draft order before you can enter the draft room.
            </p>
          )}
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">League Members</h3>
          <ScrollArea className="h-[300px] rounded-md border">
            {leagueMembers.map((member, index) => (
              <div key={member.id} className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-4">
                  <span className="font-medium">{index + 1}.</span>
                  <div>
                    <p className="font-medium">{member.team_name}</p>
                    <p className="text-sm text-muted-foreground">
  {member.users?.display_name || member.users?.email || ""}
</p>
                  </div>
                </div>
                {member.draft_position && (
                  <Badge variant="secondary">Draft #{member.draft_position}</Badge>
                )}
              </div>
            ))}
          </ScrollArea>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">League Settings and Scoring</h3>
          {leagueSettings && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Max Teams:</p>
                <p>{leagueSettings.max_teams}</p>
              </div>
              <div>
                <p className="font-medium">Upset Multiplier:</p>
                <p>{leagueSettings.upset_multiplier}</p>
              </div>
              <div>
                <p className="font-medium">Round 1 Score:</p>
                <p>{leagueSettings.round_1_score}</p>
              </div>
              <div>
                <p className="font-medium">Round 2 Score:</p>
                <p>{leagueSettings.round_2_score}</p>
              </div>
              <div>
                <p className="font-medium">Round 3 Score:</p>
                <p>{leagueSettings.round_3_score}</p>
              </div>
              <div>
                <p className="font-medium">Round 4 Score:</p>
                <p>{leagueSettings.round_4_score}</p>
              </div>
              <div>
                <p className="font-medium">Round 5 Score:</p>
                <p>{leagueSettings.round_5_score}</p>
              </div>
              <div>
                <p className="font-medium">Round 6 Score:</p>
                <p>{leagueSettings.round_6_score}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}


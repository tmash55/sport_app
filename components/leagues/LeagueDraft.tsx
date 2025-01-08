"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { createClient } from "@/libs/supabase/client"
import { Skeleton } from "@/components/ui/skeleton"

interface LeagueDraftProps {
  leagueId: string
  isCommissioner: boolean
}

export function LeagueDraft({ leagueId, isCommissioner }: LeagueDraftProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isDraftOrderSet, setIsDraftOrderSet] = useState(false)
  const [draftStatus, setDraftStatus] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchDraftData = async () => {
      setIsLoading(true)
      try {
        // Fetch league members and their draft positions
        const { data: members, error: membersError } = await supabase
          .from('league_members')
          .select('draft_position')
          .eq('league_id', leagueId)

        if (membersError) throw membersError

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

      } catch (error) {
        console.error('Error fetching draft data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDraftData()
  }, [leagueId, supabase])

  const handleButtonClick = () => {
    if (isDraftOrderSet) {
      router.push(`/draft/${leagueId}`)
    } else if (isCommissioner) {
      router.push(`/leagues/${leagueId}/set-draft-order`)
    }
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

  const getButtonText = () => {
    if (!isDraftOrderSet && isCommissioner) return "Set Draft Order"
    if (draftStatus === 'completed') return "View Draft Results"
    return "Enter Draft Room"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>League Draft</CardTitle>
        <CardDescription>
          {isDraftOrderSet
            ? "The draft order has been set. Prepare for the upcoming draft or join an ongoing one."
            : "The draft order needs to be set before the draft can begin."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          {isDraftOrderSet
            ? "The draft is where you'll select your teams for the tournament. Be sure to join on time and have your strategy ready!"
            : "As the commissioner, you need to set the draft order before the draft can start."}
        </p>
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
      </CardContent>
    </Card>
  )
}


"use client"

import { useEffect, useState } from 'react'
import { createClient } from "@/libs/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { DraftTimeModal } from "./DraftTimeModal"
import { DraftCountdown } from "./DraftCountdown"
import { Button } from "@/components/ui/button"
import Link from 'next/link'

interface League {
  id: string;
  name: string;
  commissioner_id: string;
  draft_start_time: string | null;
}

interface Draft {
  id: string;
  league_id: string;
  status: 'pre_draft' | 'in_progress' | 'paused' | 'completed';
}

function LeagueHeaderSkeleton() {
  return (
    <Card className="mb-6">
      <CardContent className="flex flex-col md:flex-row items-start justify-between p-6">
        <div className="flex-1 w-full md:w-auto space-y-2">
          <Skeleton className="h-6 w-48" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <Skeleton className="h-8 w-12 mb-1" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 md:mt-0 md:ml-4">
          <Skeleton className="h-10 w-32" />
        </div>
      </CardContent>
    </Card>
  )
}

export function LeagueHeader({ leagueId }: { leagueId: string }) {
  const [league, setLeague] = useState<League | null>(null)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [isCommissioner, setIsCommissioner] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    let leagueSubscription: any;
    let draftSubscription: any;

    async function fetchData() {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setIsLoading(false)
        return
      }

      const [{ data: leagueData, error: leagueError }, { data: draftData, error: draftError }] = await Promise.all([
        supabase.from("leagues").select('*').eq("id", leagueId).single(),
        supabase.from("drafts").select('*').eq("league_id", leagueId).single()
      ])

      if (leagueError) {
        console.error("Error fetching league data:", leagueError)
        setIsLoading(false)
        return
      }

      if (draftError && draftError.code !== 'PGRST116') {
        console.error("Error fetching draft data:", draftError)
        setIsLoading(false)
        return
      }

      setLeague(leagueData)
      setDraft(draftData || null)
      setIsCommissioner(user.id === leagueData.commissioner_id)
      setIsLoading(false)

      // Set up real-time subscriptions
      leagueSubscription = supabase
        .channel(`public:leagues:id=eq.${leagueId}`)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'leagues', filter: `id=eq.${leagueId}` }, (payload) => {
          setLeague(payload.new as League)
        })
        .subscribe()

      draftSubscription = supabase
        .channel(`public:drafts:league_id=eq.${leagueId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'drafts', filter: `league_id=eq.${leagueId}` }, (payload) => {
          setDraft(payload.new as Draft)
        })
        .subscribe()
    }

    fetchData()

    return () => {
      if (leagueSubscription) supabase.removeChannel(leagueSubscription)
      if (draftSubscription) supabase.removeChannel(draftSubscription)
    }
  }, [leagueId, supabase])

  const handleDraftTimeUpdate = (newDraftTime: Date) => {
    if (league) {
      setLeague({ ...league, draft_start_time: newDraftTime.toISOString() })
    }
  }

  if (isLoading) {
    return <LeagueHeaderSkeleton />
  }

  if (!league) {
    return <div>Error loading league data</div>
  }

  if (draft?.status === 'completed') {
    return null
  }

  return (
    <Card className="mb-6">
      <CardContent className="flex flex-col md:flex-row items-start justify-between p-6">
        <div className="flex-1 w-full md:w-auto">
          {draft?.status === 'pre_draft' && (
            <DraftCountdown draftStartTime={league.draft_start_time} />
          )}
          {(draft?.status === 'in_progress' || draft?.status === 'paused') && (
            <div className="flex items-center space-x-4">
              <span className="text-lg font-semibold">
                Draft Status: {draft.status === 'in_progress' ? 'In Progress' : 'Paused'}
              </span>
              <Button asChild>
                <Link href={`/draft/${leagueId}`}>
                  Join Draft Now
                </Link>
              </Button>
            </div>
          )}
        </div>
        {isCommissioner && draft?.status === 'pre_draft' && (
          <div className="mt-4 md:mt-0 md:ml-4">
            <DraftTimeModal 
              leagueId={leagueId} 
              currentDraftTime={league.draft_start_time ? new Date(league.draft_start_time) : null}
              onDraftTimeUpdate={handleDraftTimeUpdate}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}


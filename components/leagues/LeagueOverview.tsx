"use client"

import { useState, useEffect } from 'react'
import { createClient } from "@/libs/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { InviteMembers } from "@/components/leagues/InviteMembers"
import { DraftOrderManager } from "@/components/leagues/DraftOrderManager"

interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
}

interface LeagueMember {
  user_id: string;
  draft_position: number | null;
  users: User;
  team_name: string
}

interface LeagueDetails {
  id: string;
  name: string;
  commissioner_id: string;
  league_members: LeagueMember[];
  commissioner: User;
}

interface LeagueSetting {
  league_id: string;
  round_1_score: number;
  round_2_score: number;
  round_3_score: number;
  round_4_score: number;
  round_5_score: number;
  round_6_score: number;
  upset_multiplier: number;
  max_teams: number;
}

interface DraftSettings {
  draft_time: string;
  picks_per_second: number;
}

interface PendingInvite {
  id: string;
  email: string;
}

export function LeagueOverview({ leagueId }: { leagueId: string }) {
  const [leagueDetails, setLeagueDetails] = useState<LeagueDetails | null>(null)
  const [leagueSettings, setLeagueSettings] = useState<LeagueSetting | null>(null)
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const supabase = createClient()
  const { toast } = useToast()

  const fetchLeagueData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setCurrentUserId(user.id)
    }

    const { data: leagueData, error: leagueError } = await supabase
      .from("leagues")
      .select(`
        *,
        league_members(
          user_id,
          draft_position,
          team_name,
          users:user_id(id, email, first_name, last_name, display_name)
        ),
        commissioner:commissioner_id(id, email, first_name, last_name)
      `)
      .eq("id", leagueId)
      .single()

    if (leagueError) {
      console.error("Error fetching league details:", leagueError)
      toast({
        title: "Error",
        description: "Failed to load league details",
        variant: "destructive",
      })
      return
    }

    if (leagueData) {
      setLeagueDetails(leagueData as LeagueDetails)
    }

    const { data: settingsData, error: settingsError } = await supabase
      .from("league_settings")
      .select("*")
      .eq("league_id", leagueId)
      .single()

    if (settingsError) {
      console.error("Error fetching league settings:", settingsError)
      toast({
        title: "Error",
        description: "Failed to load league settings",
        variant: "destructive",
      })
      return
    }

    setLeagueSettings(settingsData as LeagueSetting)

    const { data: invitesData, error: invitesError } = await supabase
      .from("invites")
      .select("id, email")
      .eq("league_id", leagueId)
      .is("accepted_at", null)

    if (invitesError) {
      console.error("Error fetching pending invites:", invitesError)
    } else {
      setPendingInvites(invitesData as PendingInvite[])
    }
  }

  useEffect(() => {
    fetchLeagueData()

    const leagueChannel = supabase
      .channel('league_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leagues', filter: `id=eq.${leagueId}` }, fetchLeagueData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'league_settings', filter: `league_id=eq.${leagueId}` }, fetchLeagueData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'league_members', filter: `league_id=eq.${leagueId}` }, fetchLeagueData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'invites', filter: `league_id=eq.${leagueId}` }, fetchLeagueData)
      .subscribe()

    return () => {
      supabase.removeChannel(leagueChannel)
    }
  }, [leagueId, supabase])

  if (!leagueDetails || !leagueSettings) {
    return <div>Loading league details...</div>
  }

  const users = leagueDetails.league_members
  const commissioner = leagueDetails.commissioner
  const isCommissioner = currentUserId === commissioner.id
  const maxTeams = leagueSettings.max_teams

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">League Overview</h2>
        {isCommissioner && (
          <DraftOrderManager
            leagueId={leagueId}
            members={leagueDetails.league_members}
            onOrderUpdated={fetchLeagueData}
          />
        )}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>League Members ({users.length}/{maxTeams})</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {Array.from({ length: maxTeams }, (_, index) => {
                const member = users[index]
                const pendingInvite = pendingInvites[index - users.length]
                return (
                  <li key={index} className="flex items-start p-2 bg-secondary/50 rounded-md">
                  <span className="font-semibold mr-2 mt-1 w-6 text-right">{index + 1}.</span>
                  {member ? (
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex items-baseline">
                        <span className="font-medium">
                          {member.team_name || member.users.email}
                        </span>
                        {member.users.display_name && (
                          <span className="text-sm text-muted-foreground ml-2">
                            {member.users.display_name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        {member.draft_position && (
                          <Badge variant="secondary">Draft position #{member.draft_position}</Badge>
                        )}
                        {member.user_id === commissioner.id && (
                          <Badge variant="outline">Commissioner</Badge>
                        )}
                      </div>
                    </div>
                  ) : pendingInvite ? (
                    <div className="flex flex-1 items-center justify-between">
                      <span>{pendingInvite.email}</span>
                      <Badge variant="secondary">Invited</Badge>
                    </div>
                  ) : (
                    <div className="flex-1">
                      {isCommissioner && (
                        <InviteMembers 
                          leagueId={leagueId} 
                          onInviteSent={(email) => {
                            setPendingInvites([...pendingInvites, { id: Date.now().toString(), email }])
                            fetchLeagueData()
                          }} 
                        />
                      )}
                    </div>
                  )}
                </li>
                )
              })}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>League Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Number of Teams: {maxTeams}</p>
            <p>Round 1 Score: {leagueSettings.round_1_score}</p>
            <p>Round 2 Score: {leagueSettings.round_2_score}</p>
            <p>Round 3 Score: {leagueSettings.round_3_score}</p>
            <p>Round 4 Score: {leagueSettings.round_4_score}</p>
            <p>Round 5 Score: {leagueSettings.round_5_score}</p>
            <p>Round 6 Score: {leagueSettings.round_6_score}</p>
            <p>Upset Multiplier: {leagueSettings.upset_multiplier}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


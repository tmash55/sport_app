"use client"

import { useEffect, useState } from 'react'
import { createClient } from "@/libs/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Settings, Trophy } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

interface LeagueTeamProps {
  leagueId: string
  userId: string
}

interface User {
  email: string | null
  team_name: string | null
  avatar_url: string | null
  display_name: string | null
}

interface DraftedTeam {
  id: string;
  name: string;
  seed: number;
  scores: number[];
  totalScore: number;
}

export function LeagueTeam({ leagueId, userId }: LeagueTeamProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [draftedTeams, setDraftedTeams] = useState<DraftedTeam[]>([])
  const [maxTeams, setMaxTeams] = useState(0)
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    async function fetchData() {
      try {
        const [leagueSettingsResponse, userDataResponse, draftedTeamsResponse] = await Promise.all([
          supabase
            .from('league_settings')
            .select('max_teams')
            .eq('league_id', leagueId)
            .single(),
          supabase
            .from('league_members')
            .select('team_name, avatar_url, users!inner(email, display_name)')
            .eq('league_id', leagueId)
            .eq('user_id', userId)
            .single(),
          supabase
            .from('draft_picks')
            .select(`
              id,
              league_teams (
                id,
                name,
                global_teams (
                  seed
                )
              )
            `)
            .eq('league_id', leagueId)
            .eq('user_id', userId)
            .order('pick_number', { ascending: true })
        ])

        const { data: leagueSettings, error: settingsError } = leagueSettingsResponse
        const { data: userData, error: userError } = userDataResponse
        const { data: draftedTeamsData, error: draftedTeamsError } = draftedTeamsResponse

        if (settingsError) throw settingsError
        if (userError) throw userError
        if (draftedTeamsError) throw draftedTeamsError

        setMaxTeams(leagueSettings.max_teams)
        setUser({
          email: userData.users.email,
          team_name: userData.team_name,
          avatar_url: userData.avatar_url,
          display_name: userData.users.display_name
        })
        setDisplayName(userData.team_name || userData.users.display_name || '')
        
        // Simulating scores for each round and total score
        setDraftedTeams(draftedTeamsData.map(pick => ({
          id: pick.league_teams.id,
          name: pick.league_teams.name,
          seed: pick.league_teams.global_teams.seed,
          scores: Array(6).fill(0).map(() => Math.floor(Math.random() * 50)),
          totalScore: 0, // We'll calculate this next
        })))
      } catch (error) {
        console.error('Error fetching data:', error)
        toast({
          title: "Error",
          description: "Failed to load team data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()

    const leagueChannel = supabase
      .channel('league_team_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'league_members', filter: `league_id=eq.${leagueId} AND user_id=eq.${userId}` }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'draft_picks', filter: `league_id=eq.${leagueId} AND user_id=eq.${userId}` }, fetchData)
      .subscribe()

    return () => {
      supabase.removeChannel(leagueChannel)
    }
  }, [leagueId, userId, supabase, toast])

  useEffect(() => {
    // Calculate total scores
    setDraftedTeams(prevTeams => 
      prevTeams.map(team => ({
        ...team,
        totalScore: team.scores.reduce((sum, score) => sum + score, 0)
      }))
    )
  }, [])

  const handleUpdateProfile = async () => {
    setIsUpdating(true)
    try {
      let avatarUrl = user?.avatar_url

      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop()
        const filePath = `${leagueId}/${userId}/team-avatar.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('team-avatars')
          .upload(filePath, avatarFile, { upsert: true })

        if (uploadError) {
          throw uploadError
        }

        const { data: { publicUrl } } = supabase.storage
          .from('team-avatars')
          .getPublicUrl(filePath)

        avatarUrl = publicUrl
      }

      const { error } = await supabase
        .from('league_members')
        .update({
          team_name: displayName,
          avatar_url: avatarUrl,
        })
        .eq('league_id', leagueId)
        .eq('user_id', userId)

      if (error) throw error

      setUser(prev => ({
        ...prev!,
        team_name: displayName,
        avatar_url: avatarUrl,
      }))

      toast({
        title: "Team profile updated",
        description: "Your team profile has been updated successfully.",
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Error",
        description: "Failed to update team profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return <Skeleton className="h-[600px] w-full" />
  }

  const userDisplayName = user?.display_name || user?.email?.split('@')[0] || 'User'

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user?.avatar_url || ''} />
            <AvatarFallback>
              <Trophy className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <CardTitle className="text-2xl">{user?.team_name || userDisplayName}</CardTitle>
            <span className="text-sm text-muted-foreground">{userDisplayName}</span>
          </div>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Team Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="team-name">Team Name</Label>
                <Input
                  id="team-name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="avatar">Avatar Image</Label>
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                />
              </div>
              <Button 
                onClick={handleUpdateProfile} 
                disabled={isUpdating}
                className="w-full"
              >
                {isUpdating ? "Updating..." : "Update Profile"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-2">
        {draftedTeams.map((team) => (
          <div
            key={team.id}
            className="flex items-center justify-between bg-card rounded-xl border p-4 hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="font-semibold">{team.name}</div>
                <div className="text-sm text-muted-foreground">
                  ({team.seed})
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {team.scores.map((score, index) => (
                <div
                  key={index}
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted font-medium"
                >
                  {score}
                </div>
              ))}
              <div className="flex h-10 min-w-[4rem] items-center justify-center rounded-lg bg-primary/10 font-semibold text-primary px-3">
                {team.totalScore}
              </div>
            </div>
          </div>
        ))}
        {Array.from({ length: Math.max(0, maxTeams - draftedTeams.length) }).map((_, index) => (
          <div
            key={`empty-${index}`}
            className="flex items-center justify-between bg-muted/50 rounded-xl border border-dashed p-4"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Trophy className="h-6 w-6 text-muted-foreground/40" />
              </div>
              <div className="text-muted-foreground">Empty Slot</div>
            </div>
            <div className="flex items-center gap-3">
              {Array(6).fill(0).map((_, i) => (
                <div
                  key={i}
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/50"
                />
              ))}
              <div className="flex h-10 min-w-[4rem] items-center justify-center rounded-lg bg-muted/50" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}


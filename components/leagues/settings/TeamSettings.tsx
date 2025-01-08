"use client"

import { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/libs/supabase/client"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Trophy } from 'lucide-react'
import { DialogTitle } from "@/components/ui/dialog"

interface TeamSettingsProps {
  leagueId: string
  isCommissioner: boolean
  leagueMembers: any[]
  onUpdate: () => void
}

export function TeamSettings({ leagueId, isCommissioner, leagueMembers, onUpdate }: TeamSettingsProps) {
  const [teamName, setTeamName] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null) // Added user state
  const [members, setMembers] = useState(leagueMembers || []) // Updated useState call for members
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    fetchUser()
  }, [supabase.auth])

  useEffect(() => {
    setMembers(leagueMembers || []) // Updated useEffect
  }, [leagueMembers])

  useEffect(() => {
    if (members) {
      const currentUserMember = members.find(member => member.user_id === user?.id)
      if (currentUserMember) {
        setTeamName(currentUserMember.team_name || '')
        setAvatarUrl(currentUserMember.avatar_url || null)
      }
    }
  }, [members, user])

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No user found")

      let newAvatarUrl = avatarUrl

      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop()
        const filePath = `${leagueId}/${user.id}/team-avatar.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('team-avatars')
          .upload(filePath, avatarFile, { upsert: true })

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('team-avatars')
          .getPublicUrl(filePath)

        newAvatarUrl = publicUrl
      }

      const { error } = await supabase
        .from('league_members')
        .update({
          team_name: teamName,
          avatar_url: newAvatarUrl,
        })
        .eq('league_id', leagueId)
        .eq('user_id', user.id)

      if (error) throw error

      setAvatarUrl(newAvatarUrl)
      onUpdate()

      toast({
        title: "Team profile updated",
        description: "Your team profile has been updated successfully.",
      })
    } catch (error) {
      console.error('Error updating team settings:', error)
      toast({
        title: "Error",
        description: "Failed to update team settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <DialogTitle>Edit Team Profile</DialogTitle>
      <div className="flex items-center space-x-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={avatarUrl || ''} />
          <AvatarFallback>
            <Trophy className="h-10 w-10" />
          </AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <Label htmlFor="avatar">Team Avatar</Label>
          <Input
            id="avatar"
            type="file"
            accept="image/*"
            onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="teamName">Team Name</Label>
        <Input
          id="teamName"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          disabled={isLoading}
        />
      </div>
      <Button onClick={handleSave} disabled={isLoading}>
        {isLoading ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  )
}


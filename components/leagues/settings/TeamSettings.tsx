"use client"

import { useState, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/libs/supabase/client"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Trophy } from "lucide-react"
import { DialogTitle } from "@/components/ui/dialog"

interface LeagueMember {
  user_id: string
  team_name: string
  avatar_url: string | null
}

interface TeamSettingsProps {
  leagueId: string
  isCommissioner: boolean
  leagueMembers: LeagueMember[]
  onUpdate: (updatedData: Partial<LeagueMember>) => Promise<void>
}

export function TeamSettings({ leagueId, isCommissioner, leagueMembers, onUpdate }: TeamSettingsProps) {
  const [teamName, setTeamName] = useState("")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const fetchUserAndSetTeamData = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      const currentUserMember = leagueMembers.find((member) => member.user_id === user.id)
      if (currentUserMember) {
        setTeamName(currentUserMember.team_name || "")
        setAvatarUrl(currentUserMember.avatar_url || null)
      }
    }
  }, [supabase.auth, leagueMembers])

  useEffect(() => {
    fetchUserAndSetTeamData()
  }, [fetchUserAndSetTeamData])

  const handleSave = useCallback(async () => {
    setIsLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("No user found")


      const updatedData: Partial<LeagueMember> = {
        team_name: teamName,
      }

      await onUpdate(updatedData)


      toast({
        title: "Team profile updated",
        description: "Your team profile has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating team settings:", error)
      toast({
        title: "Error",
        description: "Failed to update team settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [leagueId, teamName, avatarFile, avatarUrl, supabase, onUpdate, toast])

  return (
    <div className="space-y-4">
      <DialogTitle>Edit Team Profile</DialogTitle>
      
      <div className="space-y-2">
        <Label htmlFor="teamName">Team Name</Label>
        <Input id="teamName" value={teamName} onChange={(e) => setTeamName(e.target.value)} disabled={isLoading} />
      </div>
      <Button onClick={handleSave} disabled={isLoading}>
        {isLoading ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  )
}


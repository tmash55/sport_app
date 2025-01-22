"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"

interface LeagueMember {
  id: string
  team_name: string
  avatar_url?: string
  users?: {
    display_name?: string
    email?: string
  }
}

interface MembersSettingsProps {
  leagueId: string
  isCommissioner: boolean
  leagueMembers: LeagueMember[]
  onUpdate: (updatedData: { removedMemberId: string }) => Promise<void>
}

export function MembersSettings({ leagueId, isCommissioner, leagueMembers, onUpdate }: MembersSettingsProps) {
  const [members, setMembers] = useState<LeagueMember[]>(leagueMembers)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setMembers(leagueMembers)
  }, [leagueMembers])

  const handleRemoveMember = useCallback(
    async (memberId: string) => {
      if (!isCommissioner) return

      setIsLoading(true)
      try {
        await onUpdate({ removedMemberId: memberId })

        setMembers((prevMembers) => prevMembers.filter((member) => member.id !== memberId))

        toast({
          title: "Success",
          description: "Member removed successfully.",
        })
      } catch (error) {
        console.error("Error removing member:", error)
        toast({
          title: "Error",
          description: "Failed to remove member. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [isCommissioner, onUpdate, toast],
  )

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">League Members</h3>
      <ScrollArea className="h-[400px] rounded-md border">
        <ul className="space-y-4 p-4">
          {members.map((member) => (
            <li key={member.id} className="flex items-center justify-between bg-secondary p-3 rounded-md">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={member.avatar_url} />
                  <AvatarFallback>
                    {(member.team_name || member.users?.display_name || "UT").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{member.team_name || member.users?.display_name || "Unnamed Team"}</p>
                  <p className="text-sm text-muted-foreground">{member.users?.email || "No email available"}</p>
                </div>
              </div>
              {isCommissioner && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemoveMember(member.id)}
                  disabled={isLoading}
                >
                  Remove
                </Button>
              )}
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  )
}


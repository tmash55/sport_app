import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/libs/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from 'lucide-react'

interface MembersSettingsProps {
  leagueId: string
  isCommissioner: boolean
  leagueMembers: any[]
  onUpdate: () => void
}

export function MembersSettings({ leagueId, isCommissioner, leagueMembers, onUpdate }: MembersSettingsProps) {
  const [members, setMembers] = useState(leagueMembers || [])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    setMembers(leagueMembers || [])
  }, [leagueMembers])

  const handleRemoveMember = async (memberId: string) => {
    if (!isCommissioner) return

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('league_members')
        .delete()
        .eq('id', memberId)
        .eq('league_id', leagueId)

      if (error) throw error

      setMembers(members.filter(member => member.id !== memberId))
      onUpdate()

      toast({
        title: "Success",
        description: "Member removed successfully.",
      })
    } catch (error) {
      console.error('Error removing member:', error)
      toast({
        title: "Error",
        description: "Failed to remove member. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">League Members</h3>
      <ul className="space-y-4">
        {members.map((member) => (
          <li key={member.id} className="flex items-center justify-between bg-secondary p-3 rounded-md">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={member.avatar_url} />
                <AvatarFallback>
                  {(member.team_name || member.users.display_name || 'UT').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {member.team_name || member.users.display_name || 'Unnamed Team'}
                </p>
                <p className="text-sm text-muted-foreground">{member.users.email}</p>
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
    </div>
  )
}


"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/libs/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, X } from "lucide-react"

interface User {
  id: string
  email: string
  display_name: string | null
}

interface LeagueMember {
  id: string
  draft_position: number | null
  league_id: string
  team_name: string | null
  users: User[]
}

interface DraftOrderManagerProps {
  leagueId: string
  maxTeams: number
  onOrderUpdated: () => void
}

export function DraftOrderManager({ leagueId, maxTeams, onOrderUpdated }: DraftOrderManagerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [draftOrder, setDraftOrder] = useState<(LeagueMember | null)[]>(Array(maxTeams).fill(null))
  const [unassignedMembers, setUnassignedMembers] = useState<LeagueMember[]>([])
  const supabase = createClient()
  const { toast } = useToast()

  const fetchLeagueMembers = async () => {
    const { data, error } = await supabase
      .from("league_members")
      .select(`
        id, 
        draft_position, 
        league_id,
        team_name,
        users (
          id,
          email,
          display_name
        )
      `)
      .eq("league_id", leagueId)

    if (error) {
      throw new Error(`Failed to fetch league members: ${error.message}`)
    }

    return data as LeagueMember[]
  }

  const loadDraftOrder = async () => {
    setIsLoading(true)
    try {
      const members = await fetchLeagueMembers()
      const newDraftOrder = Array(maxTeams).fill(null)
      const newUnassignedMembers: LeagueMember[] = []

      members.forEach((member) => {
        if (member.draft_position !== null && member.draft_position <= maxTeams) {
          newDraftOrder[member.draft_position - 1] = member
        } else {
          newUnassignedMembers.push(member)
        }
      })

      setDraftOrder(newDraftOrder)
      setUnassignedMembers(newUnassignedMembers)
    } catch (error) {
      console.error("Error loading draft order:", error)
      toast({
        title: "Error",
        description: "Failed to load draft order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadDraftOrder()
    }
  }, [isOpen])

  const assignMember = async (memberId: string, position: number) => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from("league_members")
        .update({
          draft_position: position,
        })
        .eq("id", memberId)
        .eq("league_id", leagueId)

      if (error) throw error

      await loadDraftOrder()
      toast({
        title: "Success",
        description: "Draft position updated.",
      })
      onOrderUpdated()
    } catch (error) {
      console.error("Error updating draft position:", error)
      toast({
        title: "Error",
        description: "Failed to update draft position. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const removeMember = async (memberId: string) => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from("league_members")
        .update({
          draft_position: null,
        })
        .eq("id", memberId)
        .eq("league_id", leagueId)

      if (error) throw error

      await loadDraftOrder()
      toast({
        title: "Success",
        description: "Member removed from draft position.",
      })
      onOrderUpdated()
    } catch (error) {
      console.error("Error removing member from draft position:", error)
      toast({
        title: "Error",
        description: "Failed to remove member from draft position. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const randomizeDraftOrder = async () => {
    setIsLoading(true)
    try {
      const members = await fetchLeagueMembers()
      const shuffled = [...members].sort(() => Math.random() - 0.5)

      const updates = shuffled.map((member, index) => ({
        id: member.id,
        draft_position: index < maxTeams ? index + 1 : null,
      }))

      const { error } = await supabase.from("league_members").upsert(updates)

      if (error) throw error

      await loadDraftOrder()
      toast({
        title: "Success",
        description: "Draft order has been randomized.",
      })
      onOrderUpdated()
    } catch (error) {
      console.error("Error randomizing draft order:", error)
      toast({
        title: "Error",
        description: "Failed to randomize draft order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetDraftOrder = async () => {
    setIsLoading(true)
    try {
      const members = await fetchLeagueMembers()

      const updates = members.map((member) => ({
        id: member.id,
        draft_position: null as number | null,
      }))

      const { error } = await supabase.from("league_members").upsert(updates)

      if (error) throw error

      await loadDraftOrder()
      toast({
        title: "Success",
        description: "Draft order has been reset.",
      })
      onOrderUpdated()
    } catch (error) {
      console.error("Error resetting draft order:", error)
      toast({
        title: "Error",
        description: "Failed to reset draft order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Manage Draft Order</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manage Draft Order</DialogTitle>
          <DialogDescription>Set the draft order for league members or randomize it.</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          {isLoading ? (
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            draftOrder.map((member, index) => (
              <Popover key={index}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between group">
                    <span>
                      {index + 1}.{" "}
                      {member ? member.team_name || member.users[0]?.display_name || "Unknown" : "Unassigned"}
                    </span>
                    {member && (
                      <span
                        className="ml-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeMember(member.id)
                        }}
                      >
                        <X size={16} />
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-0">
                  <ScrollArea className="h-[200px]">
                    {unassignedMembers.map((unassignedMember) => (
                      <Button
                        key={unassignedMember.id}
                        variant="ghost"
                        className="w-full justify-start hover:bg-primary hover:text-primary-foreground"
                        onClick={() => assignMember(unassignedMember.id, index + 1)}
                      >
                        {unassignedMember.team_name || unassignedMember.users[0]?.display_name || "Unknown"}
                      </Button>
                    ))}
                  </ScrollArea>
                </PopoverContent>
              </Popover>
            ))
          )}
        </div>
        <DialogFooter className="flex justify-between">
          <div>
            <Button variant="outline" onClick={() => setIsOpen(false)} className="mr-2">
              Close
            </Button>
            <Button variant="destructive" onClick={resetDraftOrder} disabled={isLoading}>
              Reset
            </Button>
          </div>
          <Button onClick={randomizeDraftOrder} disabled={isLoading}>
            {isLoading ? "Randomizing..." : "Randomize"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


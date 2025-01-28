"use client"

import { useState, useEffect, useCallback } from "react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { useLeague } from "@/app/context/LeagueContext"
import { createClient } from "@/libs/supabase/client"

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
  const [draftOrder, setDraftOrder] = useState<(LeagueMember | null)[]>([])
  const [allMembers, setAllMembers] = useState<LeagueMember[]>([])
  const { leagueData } = useLeague()
  const { toast } = useToast()

  const loadDraftOrder = useCallback(() => {
    if (!leagueData) return

    const members = leagueData.league_members
    const newDraftOrder = Array(maxTeams).fill(null)

    members.forEach((member: LeagueMember) => {
      if (member.draft_position !== null && member.draft_position <= maxTeams) {
        newDraftOrder[member.draft_position - 1] = member
      }
    })

    setDraftOrder(newDraftOrder)
    setAllMembers(members)
  }, [leagueData, maxTeams])

  useEffect(() => {
    if (isOpen) {
      loadDraftOrder()
    }
  }, [isOpen, loadDraftOrder])

  const handleAction = async (action: () => void, successMessage: string) => {
    setIsLoading(true)
    try {
      action()
      loadDraftOrder()
      onOrderUpdated()
      toast({
        title: "Success",
        description: successMessage,
      })
    } catch (error) {
      console.error("Error performing action:", error)
      toast({
        title: "Error",
        description: "Failed to perform action. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const assignMember = (memberId: string, position: number) => {
    handleAction(() => {
      const newDraftOrder = [...draftOrder]

      if (memberId === "unassigned") {
        // If the current position has a member, update their draft_position to null
        if (newDraftOrder[position - 1]) {
          const memberToUnassign = allMembers.find((m) => m.id === newDraftOrder[position - 1]?.id)
          if (memberToUnassign) {
            memberToUnassign.draft_position = null
          }
        }
        newDraftOrder[position - 1] = null
      } else {
        const memberToAssign = allMembers.find((m) => m.id === memberId)

        // Remove the member from their previous position if they had one
        const previousPosition = newDraftOrder.findIndex((m) => m?.id === memberId)
        if (previousPosition !== -1) {
          newDraftOrder[previousPosition] = null
        }

        // Assign the member to the new position
        if (memberToAssign) {
          memberToAssign.draft_position = position
          newDraftOrder[position - 1] = memberToAssign
        }
      }

      setDraftOrder(newDraftOrder)
    }, "Draft position updated.")
  }

  const randomizeDraftOrder = () => {
    handleAction(() => {
      const shuffled = [...allMembers].sort(() => Math.random() - 0.5)
      const newDraftOrder = Array(maxTeams).fill(null)

      shuffled.forEach((member, index) => {
        if (index < maxTeams) {
          member.draft_position = index + 1
          newDraftOrder[index] = member
        } else {
          member.draft_position = null
        }
      })

      setDraftOrder(newDraftOrder)
    }, "Draft order has been randomized.")
  }

  const resetDraftOrder = () => {
    handleAction(() => {
      allMembers.forEach((member) => (member.draft_position = null))
      setDraftOrder(Array(maxTeams).fill(null))
    }, "Draft order has been reset.")
  }

  const saveDraftOrderToDatabase = async () => {
    const supabase = createClient()
    const updates = allMembers.map((member) => ({
      id: member.id,
      draft_position: member.draft_position,
      league_id: leagueId,
    }))

    const { error } = await supabase.from("league_members").upsert(updates, { onConflict: "id" })

    if (error) {
      console.error("Error saving draft order:", error)
      toast({
        title: "Error",
        description: `Failed to save draft order: ${error.message}`,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Draft order saved successfully.",
      })
      onOrderUpdated()
    }
  }

  const getAvailableMembers = (currentPosition: number) => {
    const currentMember = draftOrder[currentPosition - 1]
    return allMembers.filter(
      (member) =>
        member.draft_position === null || member.draft_position === currentPosition || member.id === currentMember?.id,
    )
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          saveDraftOrderToDatabase()
        }
        setIsOpen(open)
      }}
    >
      <DialogTrigger asChild>
        <Button variant="default">Manage Draft Order</Button>
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
            draftOrder.map((member, index) => {
              const availableMembers = getAvailableMembers(index + 1)
              return (
                <div key={index} className="flex items-center space-x-2">
                  <span className="w-6 text-right">{index + 1}.</span>
                  <Select value={member?.id || "unassigned"} onValueChange={(value) => assignMember(value, index + 1)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a member" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {availableMembers.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.team_name || m.users[0]?.display_name || "Unknown"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )
            })
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


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
  const [isDirty, setIsDirty] = useState(false)
  console.log(leagueData)

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
    setIsDirty(false)
  }, [leagueData, maxTeams])

  useEffect(() => {
    if (isOpen) {
      loadDraftOrder()
    }
  }, [isOpen, loadDraftOrder])

  const assignMember = (memberId: string, position: number) => {
    const newDraftOrder = [...draftOrder]

    if (memberId === "unassigned") {
      if (newDraftOrder[position - 1]) {
        const memberToUnassign = allMembers.find((m) => m.id === newDraftOrder[position - 1]?.id)
        if (memberToUnassign) {
          memberToUnassign.draft_position = null
        }
      }
      newDraftOrder[position - 1] = null
    } else {
      const memberToAssign = allMembers.find((m) => m.id === memberId)

      const previousPosition = newDraftOrder.findIndex((m) => m?.id === memberId)
      if (previousPosition !== -1) {
        newDraftOrder[previousPosition] = null
      }

      if (memberToAssign) {
        memberToAssign.draft_position = position
        newDraftOrder[position - 1] = memberToAssign
      }
    }

    setDraftOrder(newDraftOrder)
    setIsDirty(true)
  }

  const randomizeDraftOrder = () => {
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
    setIsDirty(true)
  }

  const resetDraftOrder = () => {
    allMembers.forEach((member) => (member.draft_position = null))
    setDraftOrder(Array(maxTeams).fill(null))
    setIsDirty(true)
  }

  const saveDraftOrderToDatabase = async () => {
    setIsLoading(true)
    const supabase = createClient()
    const updates = allMembers.map((member) => ({
      id: member.id,
      draft_position: member.draft_position,
      league_id: leagueId,
    }))

    const { error } = await supabase.from("league_members").upsert(updates, { onConflict: "id" })

    setIsLoading(false)

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
      setIsDirty(false)
      onOrderUpdated()
      setIsOpen(false) // Close the dialog on successful save
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="w-full sm:w-auto ">
          Manage Draft Order
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] w-[95vw] max-w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle>Manage Draft Order</DialogTitle>
          <DialogDescription>Set the draft order for league members or randomize it.</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
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
        <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={() => setIsOpen(false)} className="w-full sm:w-auto">
              Close
            </Button>
            <Button variant="destructive" onClick={resetDraftOrder} disabled={isLoading} className="w-full sm:w-auto">
              Reset
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button onClick={randomizeDraftOrder} disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? "Randomizing..." : "Randomize"}
            </Button>
            <Button onClick={saveDraftOrderToDatabase} disabled={!isDirty || isLoading} className="w-full sm:w-auto">
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


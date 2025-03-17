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
import { Loader2, Shuffle, Save, X, Trash2 } from "lucide-react"
import { useLeague } from "@/app/context/LeagueContext"
import { createClient } from "@/libs/supabase/client"
import { ScrollArea } from "@/components/ui/scroll-area"

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
        <Button variant="default" className="w-full sm:w-auto">
          Manage Draft Order
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] w-[95vw] max-w-[95vw] sm:w-full p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Manage Draft Order</DialogTitle>
          <DialogDescription>Set the draft order for league members or randomize it.</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] px-6">
          <div className="py-4 space-y-3">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              draftOrder.map((member, index) => {
                const availableMembers = getAvailableMembers(index + 1)
                return (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="min-w-[24px] text-right font-medium">{index + 1}.</span>
                    <Select
                      value={member?.id || "unassigned"}
                      onValueChange={(value) => assignMember(value, index + 1)}
                    >
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
        </ScrollArea>

        <DialogFooter className="p-6 pt-2 border-t">
          <div className="grid grid-cols-2 gap-3 w-full">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center"
              size="sm"
            >
              <X className="h-4 w-4 mr-2" />
              <span>Close</span>
            </Button>

            <Button
              variant="destructive"
              onClick={resetDraftOrder}
              disabled={isLoading}
              className="flex items-center justify-center"
              size="sm"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              <span>Reset</span>
            </Button>

            <Button
              onClick={randomizeDraftOrder}
              disabled={isLoading}
              className="flex items-center justify-center col-span-2"
              size="sm"
            >
              <Shuffle className="h-4 w-4 mr-2" />
              <span>{isLoading ? "Randomizing..." : "Randomize Order"}</span>
            </Button>

            <Button
              onClick={saveDraftOrderToDatabase}
              disabled={!isDirty || isLoading}
              className="flex items-center justify-center col-span-2"
              variant="default"
            >
              <Save className="h-4 w-4 mr-2" />
              <span>{isLoading ? "Saving..." : "Save Changes"}</span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


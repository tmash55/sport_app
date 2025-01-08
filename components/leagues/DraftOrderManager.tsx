"use client"

import { useState } from 'react'
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

interface DraftOrderManagerProps {
  leagueId: string
  members: Array<{
    user_id: string
    league_id: string
    users: {
      id: string
      email: string
      first_name: string | null
      last_name: string | null
    }
    draft_position: number | null
  }>
  onOrderUpdated: () => void
}

export function DraftOrderManager({ leagueId, members, onOrderUpdated }: DraftOrderManagerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

const randomizeDraftOrder = async () => {
  setIsLoading(true)
  try {
    if (members.length === 0) {
      throw new Error("No members to randomize")
    }

    const shuffledMembers = [...members].sort(() => Math.random() - 0.5)
    
    // First, fetch the existing league members to get their IDs
    const { data: existingMembers, error: fetchError } = await supabase
      .from('league_members')
      .select('id, user_id')
      .eq('league_id', leagueId)

    if (fetchError) {
      throw new Error(`Failed to fetch existing members: ${fetchError.message}`)
    }

    // Create a map of user_id to id for quick lookup
    const memberIdMap = new Map(existingMembers.map(m => [m.user_id, m.id]))

    // Prepare the updates with the correct id for each member
    const updates = shuffledMembers.map((member, index) => ({
      id: memberIdMap.get(member.user_id), // Use the existing id
      league_id: leagueId,
      user_id: member.user_id,
      draft_position: index + 1
    }))

    const { error } = await supabase
      .from('league_members')
      .upsert(updates, { 
        onConflict: 'id'
      })

    if (error) {
      console.error('Supabase error:', error)
      throw new Error(`Failed to update draft positions: ${error.message}`)
    }

    toast({
      title: "Success",
      description: "Draft order has been randomized.",
    })
    onOrderUpdated()
    setIsOpen(false)
  } catch (error) {
    console.error('Error randomizing draft order:', error)
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to randomize draft order. Please try again.",
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
          <DialogDescription>
            Randomize the draft order for league members.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Current members: {members.length}
          </p>
          <p className="text-sm text-muted-foreground">
            Members with draft positions: {members.filter(m => m.draft_position !== null).length}
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={randomizeDraftOrder} disabled={isLoading}>
            {isLoading ? "Randomizing..." : "Randomize Draft Order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


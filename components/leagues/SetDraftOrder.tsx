"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/libs/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"

interface LeagueMember {
  id: string
  user_id: string
  league_id: string
  draft_position: number | null
  users: {
    id: string
    email: string
    first_name: string | null
    last_name: string | null
  }
}

interface SetDraftOrderProps {
  leagueId: string
}

export function SetDraftOrder({ leagueId }: SetDraftOrderProps) {
  const [members, setMembers] = useState<LeagueMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRandomizing, setIsRandomizing] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchMembers = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from('league_members')
          .select(`
            id,
            user_id,
            league_id,
            draft_position,
            users (
              id,
              email,
              first_name,
              last_name
            )
          `)
          .eq('league_id', leagueId)
          .order('draft_position', { ascending: true, nullsLast: true })

        if (error) throw error
        setMembers(data)
      } catch (error) {
        console.error('Error fetching members:', error)
        toast({
          title: "Error",
          description: "Failed to load league members. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchMembers()
  }, [leagueId, supabase, toast])

  const onDragEnd = (result: any) => {
    if (!result.destination) return

    const newMembers = Array.from(members)
    const [reorderedMember] = newMembers.splice(result.source.index, 1)
    newMembers.splice(result.destination.index, 0, reorderedMember)

    setMembers(newMembers.map((member, index) => ({
      ...member,
      draft_position: index + 1
    })))
  }

  const saveDraftOrder = async () => {
    try {
      const updates = members.map((member) => ({
        id: member.id,
        draft_position: member.draft_position
      }))

      const { error } = await supabase
        .from('league_members')
        .upsert(updates, { onConflict: 'id' })

      if (error) throw error

      toast({
        title: "Success",
        description: "Draft order has been saved.",
      })

      router.push(`/leagues/${leagueId}`)
    } catch (error) {
      console.error('Error saving draft order:', error)
      toast({
        title: "Error",
        description: "Failed to save draft order. Please try again.",
        variant: "destructive",
      })
    }
  }

  const randomizeDraftOrder = async () => {
    setIsRandomizing(true)
    try {
      if (members.length === 0) {
        throw new Error("No members to randomize")
      }

      const shuffledMembers = [...members].sort(() => Math.random() - 0.5)
      
      const updates = shuffledMembers.map((member, index) => ({
        id: member.id,
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

      setMembers(shuffledMembers.map((member, index) => ({
        ...member,
        draft_position: index + 1
      })))

      toast({
        title: "Success",
        description: "Draft order has been randomized.",
      })
    } catch (error) {
      console.error('Error randomizing draft order:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to randomize draft order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRandomizing(false)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set Draft Order</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">
              Total members: {members.length}
            </p>
            <p className="text-sm text-muted-foreground">
              Members with draft positions: {members.filter(m => m.draft_position !== null).length}
            </p>
          </div>
          <Button onClick={randomizeDraftOrder} disabled={isRandomizing}>
            {isRandomizing ? "Randomizing..." : "Randomize Order"}
          </Button>
        </div>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="draft-order">
            {(provided) => (
              <ul {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                {members.map((member, index) => (
                  <Draggable key={member.id} draggableId={member.id} index={index}>
                    {(provided) => (
                      <li
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="bg-secondary p-2 rounded-md flex items-center justify-between"
                      >
                        <span>{index + 1}. {member.users.first_name} {member.users.last_name} ({member.users.email})</span>
                      </li>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
        <Button onClick={saveDraftOrder} className="mt-4">Save Draft Order</Button>
      </CardContent>
    </Card>
  )
}


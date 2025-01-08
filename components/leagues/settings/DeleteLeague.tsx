import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/libs/supabase/client"
import { useRouter } from 'next/navigation'

interface DeleteLeagueProps {
  leagueId: string
  isCommissioner: boolean
  onDelete: () => void
}

export function DeleteLeague({ leagueId, isCommissioner, onDelete }: DeleteLeagueProps) {
  const [confirmText, setConfirmText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()
  const router = useRouter()

  const handleDelete = async () => {
    if (!isCommissioner || confirmText !== 'DELETE') return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/leagues/${leagueId}/delete`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete league')
      }

      toast({
        title: "Success",
        description: "League deleted successfully.",
      })
      onDelete()
      router.push('/dashboard')
    } catch (error) {
      console.error('Error deleting league:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete league. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-red-500">Warning: This action cannot be undone. All league data will be permanently deleted.</p>
      <div className="space-y-2">
        <Label htmlFor="confirmDelete">Type DELETE to confirm</Label>
        <Input
          id="confirmDelete"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          disabled={!isCommissioner || isLoading}
        />
      </div>
      <Button 
        onClick={handleDelete} 
        disabled={!isCommissioner || isLoading || confirmText !== 'DELETE'}
        variant="destructive"
      >
        {isLoading ? "Deleting..." : "Delete League"}
      </Button>
    </div>
  )
}


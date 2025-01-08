"use client"

import { useState } from "react"
import { createClient } from "@/libs/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import Datetime from "react-datetime"
import "react-datetime/css/react-datetime.css"
import moment from "moment"

interface DraftTimeModalProps {
  leagueId: string
  currentDraftTime: Date | null
  onDraftTimeUpdate: (newDraftTime: Date) => void
}

export function DraftTimeModal({ leagueId, currentDraftTime, onDraftTimeUpdate }: DraftTimeModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [draftDateTime, setDraftDateTime] = useState<moment.Moment | null>(
    currentDraftTime ? moment(currentDraftTime) : null
  )
  const supabase = createClient()
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (!draftDateTime) {
      toast({
        title: "Error",
        description: "Please select a date and time.",
        variant: "destructive",
      })
      return
    }

    // Convert local time to UTC for storage
    const utcDateTime = draftDateTime.utc()

    const { error } = await supabase
      .from("leagues")
      .update({ draft_start_time: utcDateTime.toISOString() })
      .eq("id", leagueId)

    if (error) {
      console.error("Error updating draft time:", error)
      toast({
        title: "Error",
        description: "Failed to update draft time. Please try again.",
        variant: "destructive",
      })
    } else {
      setIsOpen(false)
      onDraftTimeUpdate(utcDateTime.toDate())
      toast({
        title: "Success",
        description: "Draft time has been updated.",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          {currentDraftTime ? "Update Draft Time" : "Set Draft Time"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{currentDraftTime ? "Update Draft Time" : "Set Draft Time"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Datetime
            value={draftDateTime}
            onChange={(value) => setDraftDateTime(moment(value))}
            inputProps={{
              className: cn(
                "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              ),
              placeholder: "Select date and time"
            }}
          />
        </div>
        <Button onClick={handleSubmit}>Save</Button>
      </DialogContent>
    </Dialog>
  )
}


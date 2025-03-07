"use client"

import { useState } from "react"
import { createClient } from "@/libs/supabase/client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { useLeague } from "@/app/context/LeagueContext"
import { Clock } from "lucide-react"
import { sendDraftTimeNotification } from "@/app/actions/sendDraftTimeNotifications"


export function DraftTimeModal() {
  const { leagueData, updateLeagueData } = useLeague()
  const [isOpen, setIsOpen] = useState(false)
  const [date, setDate] = useState<Date | undefined>(
    leagueData?.draft_start_time ? new Date(leagueData.draft_start_time) : undefined,
  )
  const [time, setTime] = useState(
    leagueData?.draft_start_time ? format(new Date(leagueData.draft_start_time), "hh:mm a") : "12:00 PM",
  )
  const [isSending, setIsSending] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (!date) {
      toast({
        title: "Error",
        description: "Please select a date.",
        variant: "destructive",
      })
      return
    }

    const [timeString, period] = time.split(" ")
    const [hours, minutes] = timeString.split(":").map(Number)
    const draftDateTime = new Date(date)
    draftDateTime.setHours(
      period === "PM" && hours !== 12 ? hours + 12 : hours === 12 && period === "AM" ? 0 : hours,
      minutes,
    )

    setIsSending(true)

    try {
      // Update the draft time in the database
      const { error } = await supabase
        .from("leagues")
        .update({ draft_start_time: draftDateTime.toISOString() })
        .eq("id", leagueData?.id)

      if (error) {
        throw new Error("Failed to update draft time. Please try again.")
      }

      // Determine if this is an update or a new setting
      const isUpdate = !!leagueData?.draft_start_time

      // Send email notifications
      const emailResult = await sendDraftTimeNotification(leagueData?.id as string, draftDateTime, isUpdate)

      if (!emailResult.success) {
        // Still close the modal and update the data, but show a warning about emails
        setIsOpen(false)
        updateLeagueData({ draft_start_time: draftDateTime.toISOString() })

        toast({
          title: "Draft time updated",
          description: "Draft time saved, but there was an issue sending notification emails: " + emailResult.error,
          variant: "default",
        })
        return
      }

      // Everything succeeded
      setIsOpen(false)
      updateLeagueData({ draft_start_time: draftDateTime.toISOString() })

      toast({
        title: "Success",
        description: `Draft time has been ${isUpdate ? "updated" : "set"} and notifications sent to league members.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto">
          <Clock className="mr-2 h-4 w-4" />
          {leagueData?.draft_start_time ? "Update Draft Time" : "Set Draft Time"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{leagueData?.draft_start_time ? "Update Draft Time" : "Set Draft Time"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex justify-center">
            <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
          </div>
          <Select value={time} onValueChange={setTime}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select time" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px] overflow-y-auto">
              {Array.from({ length: 24 * 4 }).map((_, index) => {
                const hours = Math.floor(index / 4) % 12 || 12
                const minutes = (index % 4) * 15
                const period = Math.floor(index / 4) < 12 ? "AM" : "PM"
                const timeString = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} ${period}`
                return (
                  <SelectItem key={timeString} value={timeString}>
                    {timeString}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleSubmit} className="w-full" disabled={isSending}>
          {isSending ? "Saving..." : "Save"}
        </Button>
      </DialogContent>
    </Dialog>
  )
}


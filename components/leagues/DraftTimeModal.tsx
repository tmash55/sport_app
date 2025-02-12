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

export function DraftTimeModal() {
  const { leagueData, updateLeagueData } = useLeague() // ✅ Replace `mutate` with `refreshLeagueData`
  const [isOpen, setIsOpen] = useState(false)
  const [date, setDate] = useState<Date | undefined>(
    leagueData?.draft_start_time ? new Date(leagueData.draft_start_time) : undefined,
  )
  const [time, setTime] = useState(
    leagueData?.draft_start_time ? format(new Date(leagueData.draft_start_time), "hh:mm a") : "12:00 PM",
  )
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
  
    const { error } = await supabase
      .from("leagues")
      .update({ draft_start_time: draftDateTime.toISOString() })
      .eq("id", leagueData?.id)
  
    if (error) {
      toast({
        title: "Error",
        description: "Failed to update draft time. Please try again.",
        variant: "destructive",
      })
    } else {
      setIsOpen(false)
  
      // ✅ Update the local state instead of refreshing
      updateLeagueData({ draft_start_time: draftDateTime.toISOString() })
  
      toast({
        title: "Success",
        description: "Draft time has been updated.",
      })
    }
  }
  

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="ml-2">
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
                    {timeString} ET
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleSubmit} className="w-full">
          Save
        </Button>
      </DialogContent>
    </Dialog>
  )
}

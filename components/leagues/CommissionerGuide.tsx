"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { HelpCircle, CheckCircle2, Clock, Users, ListOrdered, PlayCircle } from "lucide-react"
import { useLeague } from "@/app/context/LeagueContext"

export function CommissionerGuide() {
  const [showGuide, setShowGuide] = useState(false)
  const [hasSeenGuide, setHasSeenGuide] = useState(true)
  const { leagueData, isLoading, error } = useLeague()

  useEffect(() => {
    if (leagueData) {
      const guideStatus = localStorage.getItem(`commissioner-guide-${leagueData.id}`)
      if (guideStatus !== "seen") {
        setShowGuide(true)
        setHasSeenGuide(false)
      }
    }
  }, [leagueData])

  const handleCloseGuide = () => {
    setShowGuide(false)
    if (leagueData) {
      localStorage.setItem(`commissioner-guide-${leagueData.id}`, "seen")
    }
    setHasSeenGuide(true)
  }

  if (isLoading || error || !leagueData) {
    return null
  }

  const { league_members, drafts, league_settings } = leagueData
  const maxTeams = league_settings[0].max_teams

  const activeMembers = league_members.filter((member: any) => member.user_id !== null)
  const activeCount = activeMembers.length
  const remainingSlots = maxTeams - activeCount

  const hasSetDraftTime = Boolean(leagueData.draft_start_time)
  const hasDraftOrder = activeMembers.length > 0 && activeMembers.every((member: any) => member.draft_position !== null)
  const isDraftStarted = leagueData.draft_status !== "pre_draft"

  const steps = [
    {
      title: "Set Draft Time",
      description: "Schedule when your draft will take place.",
      icon: Clock,
      completed: hasSetDraftTime,
    },
    {
      title: "Invite Members",
      description:
        remainingSlots > 0
          ? `Invite ${remainingSlots} more member${remainingSlots === 1 ? "" : "s"} to fill your league.`
          : "All slots filled!",
      icon: Users,
      completed: activeCount === maxTeams,
    },
    {
      title: "Set Draft Order",
      description:
        activeCount > 0
          ? hasDraftOrder
            ? "Draft order is set!"
            : "Determine the order in which members will make their picks."
          : "Invite members before setting draft order.",
      icon: ListOrdered,
      completed: hasDraftOrder,
    },
    {
      title: "Start Draft",
      description: isDraftStarted
        ? "Draft has started!"
        : activeCount === maxTeams && hasDraftOrder && hasSetDraftTime
          ? "Head to the draft room to begin when everyone is ready."
          : "Complete all previous steps before starting the draft.",
      icon: PlayCircle,
      completed: leagueData.draft_status !== "pre_draft",
    },
  ]

  return (
    <>
      <Dialog open={showGuide} onOpenChange={setShowGuide}>
        <DialogContent className="sm:max-w-[425px] w-[95vw] max-w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle>Commissioner&apos;s Guide</DialogTitle>
            <DialogDescription>Follow these steps to set up your league and prepare for the draft.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start justify-between gap-4 w-full">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div
                    className={`p-2 rounded-full shrink-0 ${
                      step.completed ? "bg-green-100 dark:bg-green-900/20" : "bg-gray-100 dark:bg-gray-800"
                    }`}
                  >
                    <step.icon
                      className={`h-5 w-5 ${
                        step.completed ? "text-green-600 dark:text-green-400" : "text-gray-600 dark:text-gray-400"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{step.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">{step.description}</p>
                  </div>
                </div>
                {step.completed && <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />}
              </div>
            ))}
          </div>
          <Button onClick={handleCloseGuide} className="w-full sm:w-auto py-2 px-4">
            Got it, thanks!
          </Button>
        </DialogContent>
      </Dialog>

      {hasSeenGuide && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="w-10 h-10 rounded-full"
                onClick={() => setShowGuide(true)}
              >
                <HelpCircle className="h-5 w-5" />
                <span className="sr-only">Open Commissioner&apos;s Guide</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Open Commissioner&apos;s Guide</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </>
  )
}


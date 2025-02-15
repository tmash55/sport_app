"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { HelpCircle, CheckCircle2, Clock, Users, ListOrdered, PlayCircle } from 'lucide-react'

interface CommissionerGuideProps {
  leagueId: string
  hasSetDraftTime: boolean
  hasDraftOrder: boolean
  memberCount: number
  maxMembers: number
}

export function CommissionerGuide({
  leagueId,
  hasSetDraftTime,
  hasDraftOrder,
  memberCount,
  maxMembers,
}: CommissionerGuideProps) {
  const [showGuide, setShowGuide] = useState(false)
  const [hasSeenGuide, setHasSeenGuide] = useState(true)

  useEffect(() => {
    const guideStatus = localStorage.getItem(`commissioner-guide-${leagueId}`)
    if (guideStatus !== "seen") {
      setShowGuide(true)
      setHasSeenGuide(false)
    }
  }, [leagueId])

  const handleCloseGuide = () => {
    setShowGuide(false)
    localStorage.setItem(`commissioner-guide-${leagueId}`, "seen")
    setHasSeenGuide(true)
  }

  const steps = [
    {
      title: "Set Draft Time",
      description: "Schedule when your draft will take place.",
      icon: Clock,
      completed: hasSetDraftTime,
    },
    {
      title: "Invite Members",
      description: `Invite ${maxMembers - memberCount} more members to fill your league.`,
      icon: Users,
      completed: memberCount === maxMembers,
    },
    {
      title: "Set Draft Order",
      description: "Determine the order in which members will make their picks.",
      icon: ListOrdered,
      completed: hasDraftOrder,
    },
    {
      title: "Start Draft",
      description: "Head to the draft room to begin when everyone is ready.",
      icon: PlayCircle,
      completed: false,
    },
  ]

  return (
    <>
      <Dialog open={showGuide} onOpenChange={setShowGuide}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Commissioner&apos;s Guide</DialogTitle>
            <DialogDescription>
              Follow these steps to set up your league and prepare for the draft.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className={`p-2 rounded-full ${step.completed ? "bg-green-100" : "bg-gray-100"}`}>
                  <step.icon className={`h-5 w-5 ${step.completed ? "text-green-600" : "text-gray-600"}`} />
                </div>
                <div>
                  <h4 className="font-medium">{step.title}</h4>
                  <p className="text-sm text-gray-500">{step.description}</p>
                </div>
                {step.completed && <CheckCircle2 className="h-5 w-5 text-green-600 ml-auto" />}
              </div>
            ))}
          </div>
          <Button onClick={handleCloseGuide}>Got it, thanks!</Button>
        </DialogContent>
      </Dialog>

      {hasSeenGuide && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="w-8 h-8 rounded-full"
                onClick={() => setShowGuide(true)}
              >
                <HelpCircle className="h-4 w-4" />
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

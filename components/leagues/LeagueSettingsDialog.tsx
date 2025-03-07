"use client"

import type React from "react"
import { useState, useCallback, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useLeague } from "@/app/context/LeagueContext"
import { createClient } from "@/libs/supabase/client"
import { ArrowLeft, Settings, Trophy, Users, Calendar, DollarSign, Mail } from "lucide-react"

import { LeagueGeneralSettings } from "./settings/LeagueGeneralSettings"
import { ScoringSettings } from "./settings/ScoringSettings"
import { DraftSettings } from "./settings/DraftSettings"
import { MembersSettings } from "./settings/MemberSettings"
import { InviteInstructions } from "@/components/NFL-Draft/InviteInstructions"
import { Badge } from "../ui/badge"
import { cn } from "@/lib/utils"
import { CommissionerPaymentPrompt } from "../payment/commissioner-payment-prompt"

type Section = "main" | "general" | "scoring" | "draft" | "members" | "payment" | "invite"

interface LeagueSettingsDialogProps {
  children: React.ReactNode
  leagueId: string
  isCommissioner: boolean
  defaultTab?: string
  initialScrollSection?: string
}

export function LeagueSettingsDialog({
  children,
  leagueId,
  isCommissioner,
  defaultTab,
  initialScrollSection,
}: LeagueSettingsDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<Section>("main")
  const { toast } = useToast()
  const { leagueData, updateLeagueSettings, updateLeagueName, refreshLeagueData } = useLeague()
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)

  const handleOpen = () => {
    setActiveSection((defaultTab as Section) || "main")
    setIsOpen(true)
  }

  const handleBack = () => {
    setActiveSection("main")
  }

  const handleUpdate = useCallback(
    async (updatedData: any) => {
      try {
        const supabase = createClient()

        if ("name" in updatedData) {
          await updateLeagueName(updatedData.name)
        } else if ("draft_pick_timer" in updatedData) {
          const { error } = await supabase
            .from("drafts")
            .update({ draft_pick_timer: updatedData.draft_pick_timer })
            .eq("league_id", leagueId)

          if (error) throw error
        } else {
          const { error } = await supabase.from("league_settings").update(updatedData).eq("league_id", leagueId)

          if (error) throw error
          updateLeagueSettings(updatedData)
        }

        toast({
          title: "Success",
          description: "Settings updated successfully.",
        })

        await refreshLeagueData()
      } catch (error) {
        console.error("Error updating settings:", error)
        toast({
          title: "Error",
          description: "Failed to update settings. Please try again.",
          variant: "destructive",
        })
        await refreshLeagueData()
      }
    },
    [leagueId, updateLeagueSettings, updateLeagueName, refreshLeagueData, toast],
  )

  if (!leagueData) {
    return null
  }

  const renderContent = () => {
    switch (activeSection) {
      case "general":
        return (
          <LeagueGeneralSettings
            leagueId={leagueId}
            isCommissioner={isCommissioner}
            league={leagueData}
            leagueSettings={leagueData.league_settings[0]}
            onUpdate={handleUpdate}
          />
        )
      case "scoring":
        return (
          <ScoringSettings
            leagueId={leagueId}
            isCommissioner={isCommissioner}
            leagueSettings={leagueData.league_settings[0]}
            onUpdate={handleUpdate}
          />
        )
      case "draft":
        return (
          <DraftSettings
            leagueId={leagueId}
            isCommissioner={isCommissioner}
            draft={leagueData.drafts}
            onUpdate={handleUpdate}
          />
        )
      case "members":
        return (
          <MembersSettings
            leagueId={leagueId}
            isCommissioner={isCommissioner}
            leagueMembers={leagueData.league_members}
            onUpdate={handleUpdate}
          />
        )
      case "payment":
        return <CommissionerPaymentPrompt
        leagueId={leagueId}
        leagueName={leagueData.name}
        contestId={leagueData.contest_id}
      />
      case "invite":
        return <InviteInstructions leagueId={leagueId} leagueName={leagueData.name} />
      default:
        return (
          <div className="space-y-12">
            {/* General Settings Section */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">General Settings</h2>
              <div className="grid gap-4 md:grid-cols-3">
                <Card
                  className="hover:bg-accent transition-colors cursor-pointer"
                  onClick={() => setActiveSection("general")}
                >
                  <CardHeader className="flex flex-row items-center space-y-0">
                    <Settings className="w-6 h-6 mr-4 text-primary" />
                    <CardTitle>Pool Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Adjust pool name and general preferences</p>
                  </CardContent>
                </Card>

                {isCommissioner && (
                  <Card
                    className="hover:bg-accent transition-colors cursor-pointer"
                    onClick={() => setActiveSection("scoring")}
                  >
                    <CardHeader className="flex flex-row items-center space-y-0">
                      <Trophy className="w-6 h-6 mr-4 text-primary" />
                      <CardTitle>Scoring Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">Configure how points are calculated</p>
                    </CardContent>
                  </Card>
                )}

                {isCommissioner && (
                  <Card
                    className="hover:bg-accent transition-colors cursor-pointer"
                    onClick={() => setActiveSection("draft")}
                  >
                    <CardHeader className="flex flex-row items-center space-y-0">
                      <Calendar className="w-6 h-6 mr-4 text-primary" />
                      <CardTitle>Draft Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">Configure draft timing and options</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </section>

            {/* Pool Management Section */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Pool Management</h2>
              <div className="grid gap-4 md:grid-cols-3">
                <Card
                  className="hover:bg-accent transition-colors cursor-pointer"
                  onClick={() => setActiveSection("members")}
                >
                  <CardHeader className="flex flex-row items-center space-y-0">
                    <Users className="w-6 h-6 mr-4 text-primary" />
                    <CardTitle>Member Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">View and manage pool members</p>
                  </CardContent>
                </Card>

                {isCommissioner && (
                  <Card
                  className={cn(
                    "transition-colors",
                    leagueData.payment_status === "paid" ? "opacity-90" : "hover:bg-accent cursor-pointer",
                  )}
                  onClick={() => {
                    if (leagueData.payment_status !== "paid") {
                      setActiveSection("payment")
                    }
                  }}
                >
                  <CardHeader className="flex flex-row items-center space-y-0 justify-between">
                    <div className="flex flex-row items-center">
                      <DollarSign className="w-6 h-6 mr-4 text-primary" />
                      <CardTitle>Payment</CardTitle>
                    </div>
                    {leagueData.payment_status && (
                      <Badge
                        variant={leagueData.payment_status === "paid" ? "default" : "destructive"}
                        className={cn(
                          "px-3 py-1 text-xs font-medium",
                          leagueData.payment_status === "paid"
                            ? "bg-green-500 hover:bg-green-600"
                            : "bg-red-500 hover:bg-red-600",
                        )}
                      >
                        {leagueData.payment_status === "paid" ? "Paid" : "Unpaid"}
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {leagueData.payment_status === "paid"
                        ? "Payment completed"
                        : "Manage pool payments and entry fees"}
                    </p>
                  </CardContent>
                </Card>
                )}

                {isCommissioner && (
                  <Card
                    className="hover:bg-accent transition-colors cursor-pointer"
                    onClick={() => setActiveSection("invite")}
                  >
                    <CardHeader className="flex flex-row items-center space-y-0">
                      <Mail className="w-6 h-6 mr-4 text-primary" />
                      <CardTitle>Invite Instructions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">Learn how to invite new members to your pool</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </section>
          </div>
        )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild onClick={handleOpen}>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[1000px] w-[98vw] h-[95vh] max-h-[800px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Commish HQ</DialogTitle>
        </DialogHeader>
        <ScrollArea ref={scrollContainerRef} className="h-[calc(95vh-120px)] sm:h-[calc(95vh-80px)] max-h-[720px]">
          <div className="p-6">
            {activeSection !== "main" && (
              <Button variant="ghost" onClick={handleBack} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Commish HQ
              </Button>
            )}
            {renderContent()}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}


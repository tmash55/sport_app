"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { useLeague } from "@/app/context/LeagueContext"
import { createClient } from "@/libs/supabase/client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { LeagueGeneralSettings } from "./settings/LeagueGeneralSettings"
import { ScoringSettings } from "./settings/ScoringSettings"
import { DraftSettings } from "./settings/DraftSettings"
import { MembersSettings } from "./settings/MemberSettings"
import { DeleteLeague } from "./settings/DeleteLeague"

interface LeagueSettingsDialogProps {
  children: React.ReactNode
  leagueId: string
  isCommissioner: boolean
  defaultTab?: string
}

export function LeagueSettingsDialog({ children, leagueId, isCommissioner, defaultTab }: LeagueSettingsDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(defaultTab || "general")
  const { toast } = useToast()
  const { leagueData, updateLeagueSettings, updateLeagueName, refreshLeagueData } = useLeague()

  const handleOpen = () => {
    setActiveTab(defaultTab || "general")
    setIsOpen(true)
  }
  const handleClose = () => {
    setIsOpen(false)
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild onClick={handleOpen}>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] w-[95vw] h-[90vh] max-h-[600px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>League Settings</DialogTitle>
        </DialogHeader>
        <Tabs
          orientation="vertical"
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex flex-col sm:flex-row h-full"
        >
          <div className="sm:hidden my-4 px-6">
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a tab" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">League Settings</SelectItem>
                {isCommissioner && (
                  <>
                    <SelectItem value="scoring">Scoring Settings</SelectItem>
                    <SelectItem value="draft">Draft Settings</SelectItem>
                    <SelectItem value="members">Members</SelectItem>
                    <SelectItem value="delete">Delete League</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
          <TabsList
            className={cn(
              "hidden sm:flex h-auto justify-start sm:h-full sm:flex-col",
              "w-full sm:w-48 px-6 py-2 sm:p-4",
              "border-b sm:border-b-0 sm:border-r",
              "bg-background",
            )}
          >
            <TabsTrigger
              value="general"
              className={cn(
                "w-auto sm:w-full justify-start data-[state=active]:bg-muted",
                "px-2.5 py-1.5 text-sm",
                "rounded-none sm:rounded-md",
              )}
            >
              League Settings
            </TabsTrigger>
            {isCommissioner && (
              <>
                <TabsTrigger
                  value="scoring"
                  className={cn(
                    "w-auto sm:w-full justify-start data-[state=active]:bg-muted",
                    "px-2.5 py-1.5 text-sm",
                    "rounded-none sm:rounded-md",
                  )}
                >
                  Scoring Settings
                </TabsTrigger>
                <TabsTrigger
                  value="draft"
                  className={cn(
                    "w-auto sm:w-full justify-start data-[state=active]:bg-muted",
                    "px-2.5 py-1.5 text-sm",
                    "rounded-none sm:rounded-md",
                  )}
                >
                  Draft Settings
                </TabsTrigger>
                <TabsTrigger
                  value="members"
                  className={cn(
                    "w-auto sm:w-full justify-start data-[state=active]:bg-muted",
                    "px-2.5 py-1.5 text-sm",
                    "rounded-none sm:rounded-md",
                  )}
                >
                  Members
                </TabsTrigger>
                <TabsTrigger
                  value="delete"
                  className={cn(
                    "w-auto sm:w-full justify-start data-[state=active]:bg-muted",
                    "px-2.5 py-1.5 text-sm text-red-500",
                    "rounded-none sm:rounded-md",
                  )}
                >
                  Delete League
                </TabsTrigger>
              </>
            )}
          </TabsList>
          <div className="flex-1 p-6 pt-4">
            <ScrollArea className="h-[calc(90vh-240px)] sm:h-[calc(90vh-160px)] max-h-[460px] pb-6">
              <TabsContent value="general" className="mt-0 border-0 p-1">
                <LeagueGeneralSettings
                  leagueId={leagueId}
                  isCommissioner={isCommissioner}
                  league={leagueData}
                  leagueSettings={leagueData.league_settings[0]}
                  onUpdate={handleUpdate}
                />
              </TabsContent>
              {isCommissioner && (
                <>
                  <TabsContent value="scoring" className="mt-0 border-0 p-1">
                    <ScoringSettings
                      leagueId={leagueId}
                      isCommissioner={isCommissioner}
                      leagueSettings={leagueData.league_settings[0]}
                      onUpdate={handleUpdate}
                    />
                  </TabsContent>
                  <TabsContent value="draft" className="mt-0 border-0 p-1">
                    <DraftSettings
                      leagueId={leagueId}
                      isCommissioner={isCommissioner}
                      draft={leagueData.drafts}
                      onUpdate={handleUpdate}
                    />
                  </TabsContent>
                  <TabsContent value="members" className="mt-0 border-0 p-1">
                    <MembersSettings
                      leagueId={leagueId}
                      isCommissioner={isCommissioner}
                      leagueMembers={leagueData.league_members}
                      onUpdate={handleUpdate}
                    />
                  </TabsContent>
                  <TabsContent value="delete" className="mt-0 border-0 p-1">
                    <DeleteLeague leagueId={leagueId} isCommissioner={isCommissioner} onDelete={handleClose} />
                  </TabsContent>
                </>
              )}
            </ScrollArea>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}


"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { useLeague } from "@/app/context/LeagueContext"
import { createClient } from "@/libs/supabase/client"

import { LeagueGeneralSettings } from "./settings/LeagueGeneralSettings"
import { TeamSettings } from "./settings/TeamSettings"
import { ScoringSettings } from "./settings/ScoringSettings"
import { DraftSettings } from "./settings/DraftSettings"
import { MembersSettings } from "./settings/MemberSettings"
import { DeleteLeague } from "./settings/DeleteLeague"

interface LeagueSettingsDialogProps {
  children: React.ReactNode
  leagueId: string
  isCommissioner: boolean
}

export function LeagueSettingsDialog({ children, leagueId, isCommissioner }: LeagueSettingsDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("general")
  const { toast } = useToast()
  const { leagueData, mutate } = useLeague()

  const handleOpen = () => setIsOpen(true)
  const handleClose = () => {
    setIsOpen(false)
    setActiveTab("general")
  }

  const handleUpdate = useCallback(
    async (updatedData: any) => {
      try {
        console.log("LeagueSettingsDialog: Updating with", updatedData)
        // Make the API call to update the data
        const supabase = createClient()

        if ("draft_pick_timer" in updatedData) {
          // Update the drafts table
          const { error } = await supabase
            .from("drafts")
            .update({ draft_pick_timer: updatedData.draft_pick_timer })
            .eq("league_id", leagueId)

          if (error) throw error
        } else {
          // Update the league_settings table
          const { error } = await supabase.from("league_settings").update(updatedData).eq("league_id", leagueId)

          if (error) throw error
        }

        // If the update was successful, update the local state
        mutate(
          {
            ...leagueData,
            league_settings: { ...leagueData.league_settings, ...updatedData },
            drafts: leagueData.drafts.map((draft:any) =>
              "draft_pick_timer" in updatedData ? { ...draft, draft_pick_timer: updatedData.draft_pick_timer } : draft,
            ),
          },
          false,
        )

        toast({
          title: "Success",
          description: "Settings updated successfully.",
        })

        // Revalidate data
        mutate()
      } catch (error) {
        console.error("Error updating settings:", error)
        toast({
          title: "Error",
          description: "Failed to update settings. Please try again.",
          variant: "destructive",
        })
        // Revert optimistic update
        mutate()
      }
    },
    [leagueId, leagueData, mutate, toast],
  )

  if (!leagueData) {
    return null // or a loading state if appropriate
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild onClick={handleOpen}>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] w-[95vw] h-[90vh] max-h-[600px] p-0 gap-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>League Settings</DialogTitle>
        </DialogHeader>
        <Tabs
          orientation="vertical"
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex flex-col sm:flex-row h-full"
        >
          <TabsList
            className={cn(
              "flex h-auto justify-start sm:h-full sm:flex-col",
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
            <TabsTrigger
              value="team"
              className={cn(
                "w-auto sm:w-full justify-start data-[state=active]:bg-muted",
                "px-2.5 py-1.5 text-sm",
                "rounded-none sm:rounded-md",
              )}
            >
              Team Settings
            </TabsTrigger>
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
          </TabsList>
          <div className="flex-1 p-6 pt-4">
            <ScrollArea className="h-[calc(90vh-180px)] sm:h-[calc(90vh-140px)] max-h-[480px]">
              <TabsContent value="general" className="mt-0 border-0 p-1">
                <LeagueGeneralSettings
                  leagueId={leagueId}
                  isCommissioner={isCommissioner}
                  league={leagueData}
                  leagueSettings={leagueData.league_settings}
                  draft={leagueData.drafts[0]}
                  onUpdate={handleUpdate}
                />
              </TabsContent>
              <TabsContent value="team" className="mt-0 border-0 p-1">
                <TeamSettings
                  leagueId={leagueId}
                  isCommissioner={isCommissioner}
                  leagueMembers={leagueData.league_members}
                  onUpdate={handleUpdate}
                />
              </TabsContent>
              <TabsContent value="scoring" className="mt-0 border-0 p-1">
                <ScoringSettings
                  leagueId={leagueId}
                  isCommissioner={isCommissioner}
                  leagueSettings={leagueData.league_settings}
                  onUpdate={handleUpdate}
                />
              </TabsContent>
              <TabsContent value="draft" className="mt-0 border-0 p-1">
                <DraftSettings
                  leagueId={leagueId}
                  isCommissioner={isCommissioner}
                  draft={leagueData.drafts[0]}
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
            </ScrollArea>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}


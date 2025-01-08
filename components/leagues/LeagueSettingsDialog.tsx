"use client"
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/libs/supabase/client"
import { cn } from "@/lib/utils"
import { fetchLeagueData } from "@/utils/leagueHelpers"

import { LeagueGeneralSettings } from './settings/LeagueGeneralSettings'
import { TeamSettings } from './settings/TeamSettings'
import { ScoringSettings } from './settings/ScoringSettings'
import { DraftSettings } from './settings/DraftSettings'
import { MembersSettings } from './settings/MemberSettings'
import { DeleteLeague } from './settings/DeleteLeague'

interface LeagueData {
  league: any
  leagueSettings: any
  leagueMembers: any[]
  draft: any
}

interface LeagueSettingsDialogProps {
  children: React.ReactNode
  leagueId: string
  isCommissioner: boolean
}

export function LeagueSettingsDialog({ children, leagueId, isCommissioner }: LeagueSettingsDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("general")
  const [initialData, setInitialData] = useState<LeagueData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const supabase = createClient()
  const handleUpdate = () => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const data = await fetchLeagueData(leagueId)
        setInitialData(data)
      } catch (error) {
        console.error('Error fetching league data:', error)
        toast({
          title: "Error",
          description: "Failed to load league settings. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }


  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        setIsLoading(true)
        try {
          const data = await fetchLeagueData(leagueId)
          setInitialData(data)
        } catch (error) {
          console.error('Error fetching league data:', error)
          toast({
            title: "Error",
            description: "Failed to load league settings. Please try again.",
            variant: "destructive",
          })
        } finally {
          setIsLoading(false)
        }
      }
      fetchData()
    }
  }, [isOpen, leagueId, toast])

  useEffect(() => {
    const channel = supabase
      .channel(`league_settings_${leagueId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'leagues', 
          filter: `id=eq.${leagueId}` 
        }, 
        handleUpdate
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [leagueId, supabase, handleUpdate])

  const handleOpen = async () => {
    setIsOpen(true)
  }

  const handleClose = () => {
    setIsOpen(false)
    setActiveTab("general")
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
        {isLoading ? (
          <div className="p-6">Loading...</div>
        ) : (
          <Tabs
            orientation="vertical"
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex flex-col sm:flex-row h-full"
          >
            <TabsList className={cn(
              "flex h-auto justify-start sm:h-full sm:flex-col",
              "w-full sm:w-48 px-6 py-2 sm:p-4",
              "border-b sm:border-b-0 sm:border-r",
              "bg-background"
            )}>
              <TabsTrigger 
                value="general" 
                className={cn(
                  "w-auto sm:w-full justify-start data-[state=active]:bg-muted",
                  "px-2.5 py-1.5 text-sm",
                  "rounded-none sm:rounded-md"
                )}
              >
                League Settings
              </TabsTrigger>
              <TabsTrigger 
                value="team"
                className={cn(
                  "w-auto sm:w-full justify-start data-[state=active]:bg-muted",
                  "px-2.5 py-1.5 text-sm",
                  "rounded-none sm:rounded-md"
                )}
              >
                Team Settings
              </TabsTrigger>
              <TabsTrigger 
                value="scoring"
                className={cn(
                  "w-auto sm:w-full justify-start data-[state=active]:bg-muted",
                  "px-2.5 py-1.5 text-sm",
                  "rounded-none sm:rounded-md"
                )}
              >
                Scoring Settings
              </TabsTrigger>
              <TabsTrigger 
                value="draft"
                className={cn(
                  "w-auto sm:w-full justify-start data-[state=active]:bg-muted",
                  "px-2.5 py-1.5 text-sm",
                  "rounded-none sm:rounded-md"
                )}
              >
                Draft Settings
              </TabsTrigger>
              <TabsTrigger 
                value="members"
                className={cn(
                  "w-auto sm:w-full justify-start data-[state=active]:bg-muted",
                  "px-2.5 py-1.5 text-sm",
                  "rounded-none sm:rounded-md"
                )}
              >
                Members
              </TabsTrigger>
              <TabsTrigger 
                value="delete"
                className={cn(
                  "w-auto sm:w-full justify-start data-[state=active]:bg-muted",
                  "px-2.5 py-1.5 text-sm text-red-500",
                  "rounded-none sm:rounded-md"
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
                    league={initialData?.league}
                    leagueSettings={initialData?.leagueSettings}
                    draft={initialData?.draft}
                    onUpdate={handleUpdate}
                  />
                </TabsContent>
                <TabsContent value="team" className="mt-0 border-0 p-1">
                  <TeamSettings 
                    leagueId={leagueId} 
                    isCommissioner={isCommissioner} 
                    leagueMembers={initialData?.leagueMembers}
                    onUpdate={handleUpdate}
                  />
                </TabsContent>
                <TabsContent value="scoring" className="mt-0 border-0 p-1">
                  <ScoringSettings 
                    leagueId={leagueId} 
                    isCommissioner={isCommissioner} 
                    leagueSettings={initialData?.leagueSettings}
                    onUpdate={handleUpdate}
                  />
                </TabsContent>
                <TabsContent value="draft" className="mt-0 border-0 p-1">
                  <DraftSettings 
                    leagueId={leagueId} 
                    isCommissioner={isCommissioner} 
                    draft={initialData?.draft}
                    onUpdate={handleUpdate}
                  />
                </TabsContent>
                <TabsContent value="members" className="mt-0 border-0 p-1">
                  <MembersSettings 
                    leagueId={leagueId} 
                    isCommissioner={isCommissioner} 
                    leagueMembers={initialData?.leagueMembers}
                    onUpdate={handleUpdate}
                  />
                </TabsContent>
                <TabsContent value="delete" className="mt-0 border-0 p-1">
                  <DeleteLeague leagueId={leagueId} isCommissioner={isCommissioner} onDelete={handleClose} />
                </TabsContent>
              </ScrollArea>
            </div>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}


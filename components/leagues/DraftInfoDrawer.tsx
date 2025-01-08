import React from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { ChevronUp } from 'lucide-react'
import { AvailableTeams } from "@/components/leagues/AvailableTeams"
import { MyDraftedTeams } from "@/components/leagues/MyDraftedTeams"

interface DraftInfoDrawerProps {
  draft: any
  availableTeams: any[]
  draftedTeamIds: string[]
  draftPicks: any[]
  currentUser: string | null
  maxTeams: number
  isUsersTurn: () => boolean
  handleDraftPick: (teamId: string) => Promise<void>
}

export function DraftInfoDrawer({
  draft,
  availableTeams,
  draftedTeamIds,
  draftPicks,
  currentUser,
  maxTeams,
  isUsersTurn,
  handleDraftPick
}: DraftInfoDrawerProps) {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-10" variant="outline">
          <ChevronUp className="mr-2 h-4 w-4" /> View Teams
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-7xl">
         
          <div className="p-4 pb-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {draft?.status !== 'completed' && (
                <Card className="col-span-1 lg:col-span-3">
                  <CardHeader>
                    <CardTitle>Available Teams</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AvailableTeams
                      teams={availableTeams}
                      draftedTeamIds={draftedTeamIds}
                      onDraftPick={handleDraftPick}
                      isUsersTurn={isUsersTurn()}
                      isDraftInProgress={draft?.status === 'in_progress'}
                    />
                  </CardContent>
                </Card>
              )}
              <Card className="col-span-1 lg:col-span-1">
                <CardHeader>
                  <CardTitle>My Drafted Teams</CardTitle>
                </CardHeader>
                <CardContent>
                  <MyDraftedTeams
                    draftPicks={draftPicks}
                    currentUserId={currentUser || ''}
                    maxTeams={maxTeams}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

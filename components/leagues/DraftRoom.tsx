"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { DraftBoard } from "./DraftBoard"
import { AvailableTeams } from "./AvailableTeams"

import { ScrollArea, ScrollBar } from "../ui/scroll-area"
import { BracketView } from "../DraftRoom/BracketView"
import { DraftRoomSkeleton } from "../DraftRoom/DraftRoomSkeleton"
import { Button } from "../ui/button"
import { Roster } from "../DraftRoom/Roster"
import { DraftHeader } from "../DraftRoom/DraftHeader"
import { cn } from "@/lib/utils"
import { useDraftState } from "@/hooks/use-draft-state"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { RecentPicks } from "./RecentPicks"
import DraftTimer from "./DraftTimer"

interface DraftRoomProps {
  leagueId: string
}

type ViewType = "draftBoard" | "availableTeams" | "bracketView"

export function DraftRoom({ leagueId }: DraftRoomProps) {
  const {
    draft,
    leagueMembers,
    availableTeams,
    draftPicks,
    currentUser,
    isLoading,
    isCommissioner,
    maxTeams,
    draftedTeamIds,
    leagueName,
    fetchDraftData,
    handleDraftAction,
    handleDraftPick,
    handleAutoPick,
    handleSettingsChange,
    isUsersTurn,
    getCurrentDrafter,
    matchups,
    matchupsLoading,
    matchupsError,
  } = useDraftState(leagueId)
  const [currentView, setCurrentView] = useState<ViewType>("draftBoard")
  const [isRosterOpen, setIsRosterOpen] = useState(false)

  const handleStartDraft = () => handleDraftAction("start")
  const handlePauseDraft = () => handleDraftAction("pause")
  const handleResumeDraft = () => handleDraftAction("resume")

  const currentLeagueMember = useMemo(
    () => leagueMembers.find((member) => member.user_id === currentUser),
    [leagueMembers, currentUser],
  )

  const currentLeagueMemberId = currentLeagueMember?.id ?? ""

  const renderMainContent = () => {
    switch (currentView) {
      case "draftBoard":
        return (
          <DraftBoard
            leagueMembers={leagueMembers}
            draftPicks={draftPicks}
            currentPickNumber={draft?.current_pick_number || 0}
            maxTeams={maxTeams}
            isDraftCompleted={draft?.status === "completed"}
            currentLeagueMemberId={currentLeagueMemberId}
          />
        )
      case "availableTeams":
        return (
          <ScrollArea className="h-full w-full">
            <div className="p-4">
              <AvailableTeams
                leagueId={leagueId}
                draftId={draft.id}
                onDraftPick={handleDraftPick}
                isUsersTurn={isUsersTurn()}
                isDraftInProgress={draft?.status === "in_progress"}
                leagueTeams={availableTeams}
                draftPicks={draftPicks}
              />
            </div>
          </ScrollArea>
        )
      case "bracketView":
        return (
          <ScrollArea className="h-full w-full">
            <BracketView
              matchups={matchups}
              matchupsLoading={matchupsLoading}
              matchupsError={matchupsError}
              currentUser={currentLeagueMemberId}
              leagueMembers={leagueMembers}
            />
          </ScrollArea>
        )
      default:
        return null
    }
  }

  if (isLoading || !draft) {
    return <DraftRoomSkeleton />
  }

  const currentRound = Math.floor((draft.current_pick_number - 1) / maxTeams) + 1
  const totalRounds = Math.floor(64 / maxTeams)

  const getRoundDisplay = () => {
    if (currentRound >= totalRounds) {
      return "Final Round"
    }
    return `Round ${currentRound} of ${totalRounds}`
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <DraftHeader
        leagueName={leagueName}
        minutesPerPick={draft.draft_pick_timer / 60}
        maxTeams={maxTeams}
        totalRounds={Math.floor(64 / maxTeams)}
        draftStatus={draft?.status}
        onStartDraft={handleStartDraft}
        onPauseDraft={handlePauseDraft}
        onResumeDraft={handleResumeDraft}
        isCommissioner={isCommissioner}
        leagueId={leagueId}
      />
      <div className="flex-1 flex flex-col lg:flex-row gap-4 h-[calc(100vh-6rem)] overflow-hidden pt-2 px-2 lg:px-4">
        <div className="w-full lg:w-[30%] xl:w-[20%] flex flex-col gap-4">
          <Card
             className={cn(
              "h-[100px] sm:h-[120px] lg:h-[140px] flex-shrink-0 relative overflow-hidden transition-all duration-500",
              isUsersTurn() ? "animate-pulse-border bg-gradient-to-r from-green-500 to-green-700 shadow-lg" : "bg-card",
            )}
          >
            <CardContent className="h-full p-3 flex flex-col justify-center">
              <div className="flex flex-row lg:flex-col xl:flex-row h-full">
                <div className="w-1/2 lg:w-full xl:w-1/2 flex flex-col items-center justify-center mb-0 lg:mb-2 xl:mb-0">
                  <div className="text-center">
                    <h3
                      className={cn(
                        "text-sm lg:text-base font-semibold mb-1",
                        isUsersTurn() ? "text-white" : "text-foreground",
                      )}
                    >
                      {getRoundDisplay()}
                    </h3>
                    {draft && (
                      <DraftTimer
                        status={draft.status}
                        timerExpiresAt={draft.timer_expires_at}
                        onTimerExpire={handleAutoPick}
                      />
                    )}
                  </div>
                </div>
                <div
                  className={cn(
                    "w-1/2 lg:w-full xl:w-1/2 flex flex-col items-center justify-center",
                    isUsersTurn() ? " xl:border-l lg:border-white/30" : " xl:border-l lg:border-border",
                  )}
                >
                  <p className={cn("text-xs lg:text-sm", isUsersTurn() ? "text-white/80" : "text-muted-foreground")}>
                    On the Clock
                  </p>
                  <p
                    className={cn(
                      "text-base lg:text-lg xl:text-xl font-bold mt-1",
                      isUsersTurn() ? "text-white" : "text-foreground",
                    )}
                  >
                    {getCurrentDrafter()?.team_name || "Unknown"}
                  </p>
                </div>
              </div>
            </CardContent>
            {isUsersTurn() && (
              <div className="absolute inset-0 bg-white opacity-20 animate-pulse pointer-events-none"></div>
            )}
          </Card>
          
              <RecentPicks
                draftPicks={draftPicks}
                leagueMembers={leagueMembers}
                currentPickNumber={draft?.current_pick_number || 0}
              />


          <Card className="flex-1 overflow-hidden lg:block hidden">
            <CardContent className="p-2 lg:p-4 h-full">
              <ScrollArea className="h-full">
                <Roster
                  draftPicks={draftPicks}
                  currentLeagueMemberId={currentLeagueMemberId}
                  maxTeams={maxTeams}
                  leagueMembers={leagueMembers}
                />
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="w-full lg:w-[70%] xl:w-[80%] flex flex-col gap-4 overflow-hidden">
          <Card>
          <CardContent className="p-2 lg:p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="text-lg sm:text-xl lg:text-2xl font-bold">
            {currentView === "draftBoard"
              ? "Draft Board"
              : currentView === "availableTeams"
                ? "Available Teams"
                : "Bracket View"}
          </div>
         
          <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-2 w-full sm:w-auto">
            <Button
              onClick={() => setCurrentView("draftBoard")}
              variant={currentView === "draftBoard" ? "default" : "outline"}
              size="sm"
              className="w-full sm:w-auto"
            >
              Draft Board
            </Button>
            <Button
              onClick={() => setCurrentView("availableTeams")}
              variant={currentView === "availableTeams" ? "default" : "outline"}
              size="sm"
              className="w-full sm:w-auto"
            >
              Available Teams
            </Button>
            <Button
              onClick={() => setCurrentView("bracketView")}
              variant={currentView === "bracketView" ? "default" : "outline"}
              size="sm"
              className="w-full sm:w-auto"
            >
              Bracket View
            </Button>
          </div>
        </div>
      </CardContent>
          </Card>

          <div className="flex-1 overflow-hidden min-h-[300px] sm:min-h-[400px] pb-2">
            <Card className="h-full">
              <CardContent className="h-full p-2 lg:p-4 overflow-auto">
                <ScrollArea className="h-full">
                  <div className="min-w-[800px] lg:min-w-0">{renderMainContent()}</div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile Roster Button */}
      <div className="lg:hidden fixed bottom-4 right-4 z-10">
        <Sheet open={isRosterOpen} onOpenChange={setIsRosterOpen}>
          <SheetTrigger asChild>
            <Button size="lg" className="rounded-full shadow-lg">
              <Menu className="mr-2 h-4 w-4" />
              Roster
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh]">
            <ScrollArea className="h-full mt-6">
              <Roster
                draftPicks={draftPicks}
                currentLeagueMemberId={currentLeagueMemberId}
                maxTeams={maxTeams}
                leagueMembers={leagueMembers}
              />
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}


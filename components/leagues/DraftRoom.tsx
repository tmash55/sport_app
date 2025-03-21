"use client"

import { useState, useMemo, useEffect, useRef } from "react"
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
  const [showPausedAlert, setShowPausedAlert] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const handleStartDraft = () => handleDraftAction("start")
  const handlePauseDraft = () => handleDraftAction("pause")
  const handleResumeDraft = () => handleDraftAction("resume")

  // Track if we've already done the initial view setup
  const initialViewSetRef = useRef(false)

  // Track the previous turn state to detect when it becomes the user's turn
  const prevIsUsersTurnRef = useRef(false)

  const currentLeagueMember = useMemo(
    () => leagueMembers.find((member) => member.user_id === currentUser.id),
    [leagueMembers, currentUser],
  )

  useEffect(() => {
    if (draft?.status === "paused") {
      setIsExiting(false)
    } else {
      setIsExiting(true)
    }
  }, [draft?.status])

  useEffect(() => {
    // Only navigate to available teams when it BECOMES the user's turn
    // AND the draft is not completed
    const isUsersTurnNow = isUsersTurn()
    const isDraftActive = draft?.status === "in_progress"

    if (isUsersTurnNow && !prevIsUsersTurnRef.current && isDraftActive) {
      setCurrentView("availableTeams")
    }

    // Update the ref for the next check
    prevIsUsersTurnRef.current = isUsersTurnNow
  }, [isUsersTurn, draft?.status])

  // Reset to draft board view when the component mounts or when draft data changes
  useEffect(() => {
    // Only set the initial view once when data is loaded
    if (!isLoading && draft) {
      // Always set to draftBoard if the draft is completed
      if (draft.status === "completed") {
        setCurrentView("draftBoard")
      }
      // For other statuses, only set to draftBoard on initial load
      else if (!initialViewSetRef.current) {
        setCurrentView("draftBoard")
      }

      initialViewSetRef.current = true
    }
  }, [isLoading, draft])

  const isDraftOrderSet = useMemo(() => {
    return leagueMembers.every((member) => member.draft_position !== null)
  }, [leagueMembers])

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
            <div className="px-0 sm:px-4">
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
        isDraftOrderSet={isDraftOrderSet}
      />

      <div className="flex-1 flex flex-col lg:flex-row gap-4 h-[calc(100vh-6rem)] overflow-hidden pt-2 px-2 lg:px-4">
        <div className="w-full lg:w-[30%] xl:w-[20%] flex flex-col gap-4">
          <Card
            className={cn(
              "h-[100px] sm:h-[120px] lg:h-[140px] flex-shrink-0 relative overflow-hidden transition-all duration-500",
              isUsersTurn() && draft?.status === "in_progress"
                ? "animate-pulse-border bg-gradient-to-r from-green-500 to-green-700 shadow-lg"
                : "bg-card",
            )}
          >
            <CardContent className="h-full p-3 flex flex-col justify-center">
              <div className="flex flex-row lg:flex-col xl:flex-row h-full">
                <div className="w-1/2 lg:w-full xl:w-1/2 flex flex-col items-center justify-center mb-0 lg:mb-2 xl:mb-0">
                  <div className="text-center">
                    <h3
                      className={cn(
                        "text-sm lg:text-base font-semibold mb-1",
                        isUsersTurn() && draft?.status === "in_progress" ? "text-white" : "text-foreground",
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
                    isUsersTurn() && draft?.status === "in_progress"
                      ? " xl:border-l lg:border-white/30"
                      : " xl:border-l lg:border-border",
                  )}
                >
                  <p
                    className={cn(
                      "text-xs lg:text-sm",
                      isUsersTurn() && draft?.status === "in_progress" ? "text-white/80" : "text-muted-foreground",
                    )}
                  >
                    {draft?.status === "completed" ? "Draft Complete" : "On the Clock"}
                  </p>
                  <p
                    className={cn(
                      "text-base lg:text-lg xl:text-xl font-bold mt-1 text-center",
                      isUsersTurn() && draft?.status === "in_progress" ? "text-white" : "text-foreground",
                    )}
                  >
                    {draft?.status === "completed" ? "All Picks Made" : getCurrentDrafter()?.team_name || "Unknown"}
                  </p>
                </div>
              </div>
            </CardContent>
            {isUsersTurn() && draft?.status === "in_progress" && (
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
                    className={cn(
                      "w-full sm:w-auto",
                      isUsersTurn() &&
                        draft?.status === "in_progress" &&
                        (currentView === "availableTeams"
                          ? "bg-green-500 hover:bg-green-600 text-white"
                          : "border-green-500 text-green-500 hover:bg-green-500/10 dark:hover:bg-green-500/20"),
                    )}
                    disabled={draft?.status === "completed"}
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
                  <div
                    className={cn("w-full", currentView === "availableTeams" ? "min-w-0" : "min-w-[800px] lg:min-w-0")}
                  >
                    {renderMainContent()}
                  </div>
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


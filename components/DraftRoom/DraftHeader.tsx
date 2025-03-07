"use client"

import { LogOut, Info, Pause, Play, Menu, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert } from "@/components/ui/alert"
import { ThemeSwitchingLogo } from "../ui/ThemeSwitchingLogo"

interface DraftHeaderProps {
  leagueName: string
  minutesPerPick: number
  maxTeams: number
  totalRounds: number
  draftStatus: "pre_draft" | "in_progress" | "paused" | "completed"
  onStartDraft: () => void
  onPauseDraft: () => void
  onResumeDraft: () => void
  isCommissioner: boolean
  leagueId: string
  isDraftOrderSet: boolean
}

export function DraftHeader({
  leagueName,
  minutesPerPick,
  maxTeams,
  totalRounds,
  draftStatus,
  onStartDraft,
  onPauseDraft,
  onResumeDraft,
  isCommissioner,
  leagueId,
  isDraftOrderSet,
}: DraftHeaderProps) {
  const { theme, setTheme } = useTheme()
  const isDark = theme === "dark"

  const handleDraftAction = () => {
    if (draftStatus === "pre_draft") {
      if (isDraftOrderSet) {
        onStartDraft()
      } else {
        // You might want to show a toast or alert here
        console.log("Please set the draft order before starting the draft")
      }
    } else if (draftStatus === "in_progress") {
      onPauseDraft()
    } else if (draftStatus === "paused") {
      onResumeDraft()
    }
  }

  const getDraftActionText = () => {
    if (draftStatus === "pre_draft") {
      return isDraftOrderSet ? "Start Draft" : "You need to set the draft order first."
    } else if (draftStatus === "in_progress") {
      return "Pause Draft"
    } else if (draftStatus === "paused") {
      return "Resume Draft"
    }
    return ""
  }

  const getDraftActionIcon = () => {
    if (draftStatus === "pre_draft") {
      return isDraftOrderSet ? <Play className="h-4 w-4" /> : <Play className="h-4 w-4" />
    } else if (draftStatus === "in_progress") {
      return <Pause className="h-4 w-4" />
    } else if (draftStatus === "paused") {
      return <Play className="h-4 w-4" />
    }
    return null
  }

  return (
    <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto py-2">
        <div className="flex items-center justify-between">
          {/* League Info */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center">
              <ThemeSwitchingLogo className="h-8 w-10" />
            </div>
            <div className="flex items-center gap-2">
              <div
                className={cn("w-1.5 h-1.5 rounded-full", {
                  "bg-yellow-500/70": draftStatus === "pre_draft",
                  "bg-green-500/70": draftStatus === "in_progress",
                  "bg-red-500/70": draftStatus === "paused",
                  "bg-gray-500/70": draftStatus === "completed",
                })}
              />
              <div>
                <h1 className="text-base font-semibold leading-none mb-0.5">{leagueName}</h1>
                <p className="text-xs text-muted-foreground leading-none">
                  {minutesPerPick < 1
                    ? `${Math.round(minutesPerPick * 60)} Seconds Per Pick`
                    : `${minutesPerPick} ${minutesPerPick === 1 ? "Minute" : "Minutes"} Per Pick`}{" "}
                  · {maxTeams} Teams · {totalRounds} Rounds
                </p>
              </div>
            </div>
          </div>

          {/* Mobile Actions */}
          <div className="sm:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Menu className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => window.open("/how-to-play/march-madness-draft", "_blank")}>
                  <Info className="mr-2 h-4 w-4" />
                  <span>Rules</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme(isDark ? "light" : "dark")}>
                  {isDark ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                  <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
                </DropdownMenuItem>
                {isCommissioner && draftStatus !== "completed" && (
                  <DropdownMenuItem
                    onClick={handleDraftAction}
                    disabled={draftStatus === "pre_draft" && !isDraftOrderSet}
                    className={cn(
                      draftStatus === "pre_draft" || draftStatus === "paused"
                        ? "bg-green-600/10 text-green-600 hover:bg-green-600/20 hover:text-green-700"
                        : "bg-red-600/10 text-red-600 hover:bg-red-600/20 hover:text-red-700",
                    )}
                  >
                    {getDraftActionIcon()}
                    <span className="ml-2">{getDraftActionText()}</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/pools/march-madness-draft/${leagueId}`} className="flex items-center">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Exit to Dashboard</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center gap-1.5">
            <TooltipProvider>
              <div className="flex items-center gap-1.5">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => window.open("/how-to-play/march-madness-draft", "_blank")}
                    >
                      <Info className="h-4 w-4" />
                      <span className="sr-only">Rules</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Rules</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setTheme(isDark ? "light" : "dark")}
                    >
                      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                      <span className="sr-only">Toggle theme</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isDark ? "Light mode" : "Dark mode"}</p>
                  </TooltipContent>
                </Tooltip>

                {isCommissioner && draftStatus !== "completed" && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                    <Button
                        variant="default"
                        size="sm"
                        className={cn(
                          "h-8 px-3 flex items-center gap-1.5",
                          draftStatus === "pre_draft" || draftStatus === "paused"
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "bg-red-600 hover:bg-red-700 text-white",
                        )}
                        onClick={handleDraftAction}
                        disabled={draftStatus === "pre_draft" && !isDraftOrderSet}
                      >
                        {getDraftActionIcon()}
                        <span className="sr-only">{getDraftActionText()}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{getDraftActionText()}</p>
                    </TooltipContent>
                  </Tooltip>
                )}

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <Link href={`/dashboard/pools/march-madness-draft/${leagueId}`}>
                        <LogOut className="h-4 w-4" />
                        <span className="sr-only">Exit to Dashboard</span>
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Exit to Dashboard</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* Pause Alert */}
      {draftStatus === "paused" && (
        <div
          className={cn(
            "w-full bg-red-600 backdrop-blur supports-[backdrop-filter]:bg-red-700",
            "animate-in fade-in slide-in-from-top duration-150",
          )}
        >
          <div className="container mx-auto">
            <Alert variant="destructive" className="rounded-none border-0 bg-transparent py-2.5">
              <div className="flex items-center gap-3">
                <Info className="h-5 w-5 text-white" />
                <div className="flex items-center gap-2 min-w-0">
                  <p className="text-sm font-medium text-white">Draft Paused</p>
                  <p className="text-sm text-slate-100">The draft has been paused by the commissioner.</p>
                </div>
                {isCommissioner && (
                  <Button
                    variant="link"
                    className="ml-auto text-sm font-medium text-white hover:text-slate-200 h-auto p-0"
                    onClick={onResumeDraft}
                  >
                    Resume Draft
                  </Button>
                )}
              </div>
            </Alert>
          </div>
        </div>
      )}
    </header>
  )
}


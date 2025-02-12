"use client"
import { LogOut, Info, Pause, Play, Menu, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
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
}: DraftHeaderProps) {
  const { theme, setTheme } = useTheme()
  const isDark = theme === "dark"

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto py-2 md:py-4">
        <div className="flex items-center justify-between">
          {/* League Info */}
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center pr-2">
              <ThemeSwitchingLogo />
            </div>
            <div
              className={cn("w-2 h-2 md:w-3 md:h-3 rounded-full", {
                "bg-yellow-500": draftStatus === "pre_draft",
                "bg-green-500": draftStatus === "in_progress",
                "bg-red-500": draftStatus === "paused",
                "bg-gray-500": draftStatus === "completed",
              })}
            />
            <div>
              <h1 className="text-lg md:text-2xl font-bold truncate max-w-[150px] md:max-w-none">{leagueName}</h1>
              <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">
                {minutesPerPick < 1
                  ? `${Math.round(minutesPerPick * 60)} Seconds Per Pick`
                  : `${minutesPerPick} ${minutesPerPick === 1 ? "Minute" : "Minutes"} Per Pick`}{" "}
                · {maxTeams} Teams · {totalRounds} Rounds
              </p>
            </div>
          </div>

          {/* Mobile Actions */}
          <div className="sm:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-10 w-10">
                  <Menu className="h-5 w-5" />
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
                    onClick={
                      draftStatus === "pre_draft"
                        ? onStartDraft
                        : draftStatus === "in_progress"
                          ? onPauseDraft
                          : onResumeDraft
                    }
                  >
                    {draftStatus === "pre_draft" && <Play className="mr-2 h-4 w-4" />}
                    {draftStatus === "in_progress" && <Pause className="mr-2 h-4 w-4" />}
                    {draftStatus === "paused" && <Play className="mr-2 h-4 w-4" />}
                    <span>
                      {draftStatus === "pre_draft"
                        ? "Start Draft"
                        : draftStatus === "in_progress"
                          ? "Pause Draft"
                          : "Resume Draft"}
                    </span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/leagues/${leagueId}`} className="flex items-center">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Exit to Dashboard</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center gap-2">
            <TooltipProvider>
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10"
                      onClick={() => window.open("/how-to-play/march-madness-draft", "_blank")}
                    >
                      <Info className="h-5 w-5" />
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
                      variant="outline"
                      size="icon"
                      className="h-10 w-10"
                      onClick={() => setTheme(isDark ? "light" : "dark")}
                    >
                      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
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
                        variant="outline"
                        size="icon"
                        className="h-10 w-10"
                        onClick={
                          draftStatus === "pre_draft"
                            ? onStartDraft
                            : draftStatus === "in_progress"
                              ? onPauseDraft
                              : onResumeDraft
                        }
                      >
                        {draftStatus === "pre_draft" && <Play className="h-5 w-5" />}
                        {draftStatus === "in_progress" && <Pause className="h-5 w-5" />}
                        {draftStatus === "paused" && <Play className="h-5 w-5" />}
                        <span className="sr-only">
                          {draftStatus === "pre_draft"
                            ? "Start Draft"
                            : draftStatus === "in_progress"
                              ? "Pause Draft"
                              : "Resume Draft"}
                        </span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {draftStatus === "pre_draft"
                          ? "Start Draft"
                          : draftStatus === "in_progress"
                            ? "Pause Draft"
                            : "Resume Draft"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                )}

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="h-10 w-10" asChild>
                      <Link href={`/dashboard/leagues/${leagueId}`}>
                        <LogOut className="h-5 w-5" />
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
    </header>
  )
}


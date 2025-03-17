"use client"

import { cn } from "@/lib/utils"
import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"

interface RoundInfo {
  name: string
  dates: string
  location?: string
}

const rounds: RoundInfo[] = [
  { name: "1st Round", dates: "March 20-21" },
  { name: "2nd Round", dates: "March 22-23" },
  { name: "Sweet 16", dates: "March 27-28" },
  { name: "Elite Eight", dates: "March 29-30" },
  { name: "Final Four", dates: "April 5" },
  { name: "Championship", dates: "April 7" },
  { name: "Final Four", dates: "April 5" },
  { name: "Elite Eight", dates: "March 29-30" },
  { name: "Sweet 16", dates: "March 27-28" },
  { name: "2nd Round", dates: "March 22-23" },
  { name: "1st Round", dates: "March 20-21" },
]

interface BracketHeaderProps {
  className?: string
}

export function BracketHeader({ className }: BracketHeaderProps) {
  const [showRounds, setShowRounds] = useState(false)

  return (
    <div className={cn("w-full", className)}>
      <div className="px-1 py-2 flex flex-col">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-[#11274F] dark:text-foreground">
            Men&apos;s NCAA Tournament Bracket 2024-25
          </h1>
          <Button variant="ghost" size="sm" onClick={() => setShowRounds(!showRounds)} className="h-8 w-8 p-0">
            {showRounds ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            <span className="sr-only">{showRounds ? "Hide rounds" : "Show rounds"}</span>
          </Button>
        </div>

        {showRounds && (
          <div className="mt-2">
            <div className="grid grid-cols-3 gap-1 sm:grid-cols-6 md:grid-cols-11 rounded-md border bg-background/50">
              {rounds.map((round, index) => (
                <div
                  key={`${round.name}-${index}`}
                  className={cn(
                    "flex flex-col items-center justify-center p-1 text-center",
                    index === 5 && "border-x border-border/50 bg-primary/5",
                    index >= 6 && "hidden md:flex", // Hide on mobile, show on md and up
                  )}
                >
                  <span className="text-xs font-semibold text-[#11274F] dark:text-foreground">{round.name}</span>
                  <span className="mt-0.5 text-[10px] text-muted-foreground">{round.dates}</span>
                  {round.location && <span className="mt-0.5 text-[10px] text-muted-foreground">{round.location}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


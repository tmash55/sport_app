"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, AlertCircle } from "lucide-react"
import { PiFootballHelmetBold, PiGolf, PiBasketball } from "react-icons/pi"
import Link from "next/link"
import { PulseButton } from "./StyledButton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Contest {
  id: string
  name: string
  contest_type: string
  description: string
  sport: string
  max_players: number
  min_players: number
  setup_time: number
  status: "active" | "coming_soon"
}

interface ContestCardProps {
  contest: Contest
}

// Add this function after the imports
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .trim()
}

export function ContestCard({ contest }: ContestCardProps) {
  const SportIcon = ({ sport, className = "" }: { sport: string; className?: string }) => {
    switch (sport.toLowerCase()) {
      case "football":
        return <PiFootballHelmetBold className={className} />
      case "ncaab":
        return <PiBasketball className={className} />
      case "pga":
        return <PiGolf className={className} />
      default:
        return <PiBasketball className={className} />
    }
  }

  const sport = contest?.sport || "Unknown"
  const isActive = contest.status === "active"

  return (
    <TooltipProvider>
      <Card
        className={`
          group relative h-full w-full bg-card text-card-foreground border-border 
          overflow-hidden transition-all duration-300 hover:shadow-lg 
          ${isActive ? "hover:shadow-primary/20 hover:-translate-y-1" : "opacity-75 hover:opacity-90"}
        `}
      >
        {/* Gradient background for active contests */}
        <div
          className={`
            absolute inset-0 bg-gradient-to-br 
            ${isActive ? "from-primary/10 to-secondary/10" : "from-muted/5 to-muted/10"} 
            opacity-50 transition-opacity group-hover:opacity-100
          `}
        />

        <CardHeader className="relative pb-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-start gap-6">
              <div className="mt-2 p-2 bg-background rounded-full shadow-md">
                <SportIcon sport={sport} className="h-16 w-16" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2 mb-3">
                  <Badge
                    variant="secondary"
                    className="text-xs font-medium py-1.5 px-3 flex items-center gap-2 bg-secondary/20"
                  >
                    <SportIcon sport={sport} className="h-4 w-4" />
                    {contest.sport.toUpperCase()}
                  </Badge>
                </div>
                <h2
                  className={`
                    text-4xl font-bold leading-tight tracking-tight
                    ${isActive ? "text-foreground drop-shadow-sm" : "text-muted-foreground"}
                  `}
                >
                  {contest.name.split(" ").map((word, i) => (
                    <span key={i} className="block">
                      {word}
                    </span>
                  ))}
                </h2>
              </div>
            </div>
            <Badge
              variant={isActive ? "default" : "secondary"}
              className={`
                text-xs font-medium px-3 py-1
                ${isActive ? "bg-primary/90 shadow-sm" : "bg-muted"}
              `}
            >
              {isActive ? "Active" : "Coming Soon"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="relative space-y-8">
          <p className="text-lg text-muted-foreground mt-6">{contest.description}</p>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span>
                {contest.min_players} - {contest.max_players} players
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>Setup: {contest.setup_time} minutes</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="relative mt-4 flex justify-between gap-4">
          <Button
            asChild
            variant="outline"
            className="
              flex-1 h-12 bg-background text-foreground border-border 
              hover:bg-accent hover:text-accent-foreground 
              transition-all duration-300 hover:shadow-md
            "
          >
            <Link href={`/how-to-play/${slugify(contest.name)}`}>View Rules</Link>
          </Button>

          {isActive ? (
            <PulseButton
              asChild
              className="
                flex-1 h-12 shadow-sm hover:shadow-md 
                transition-shadow duration-300
                bg-primary hover:bg-primary/90
              "
            >
              <Link href={`/pools/${contest.id}/details`}>Create Pool</Link>
            </PulseButton>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  disabled
                  className="
                    flex-1 h-12 bg-muted text-muted-foreground 
                    cursor-not-allowed transition-opacity duration-300
                    hover:opacity-80
                  "
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Coming Soon
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>This contest will be available soon!</p>
              </TooltipContent>
            </Tooltip>
          )}
        </CardFooter>
      </Card>
    </TooltipProvider>
  )
}


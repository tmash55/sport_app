import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Trophy } from "lucide-react"

// Define types for all component props
interface EmptyRegionProps {
  name: string
  direction?: "ltr" | "rtl"
}

interface EmptyMatchProps {
  roundIndex: number
  direction?: "ltr" | "rtl"
  isSpecial?: boolean
}

interface EmptyTeamInfoProps {
  position: "top" | "bottom"
  direction?: "ltr" | "rtl"
  isSpecial?: boolean
}

export function EmptyBracket() {
  return (
    <ScrollArea className="w-full rounded-lg">
      <div className="min-w-[300px] w-full max-w-[1400px] mx-auto px-2 sm:px-4">
        <div className="space-y-6 sm:space-y-8 lg:space-y-16">
          {/* Top Regions: East and South */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 mb-6 sm:mb-8 lg:mb-16">
            <EmptyRegion name="East" direction="ltr" />
            <EmptyRegion name="South" direction="rtl" />
          </div>

          {/* Middle: Final Four and Championship */}
          <div className="flex flex-col items-center gap-4 mt-8 sm:mt-12 lg:mt-16 mb-6 sm:mb-8 lg:mb-16">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 items-center max-w-5xl mx-auto pt-8 sm:pt-16 lg:pt-8">
              {/* Left Final Four */}
              <div className="relative">
                <EmptyFinalFourMatch />
              </div>

              {/* Championship */}
              <div className="relative px-2 sm:px-4">
                <EmptyChampionshipMatch />
              </div>

              {/* Right Final Four */}
              <div className="relative">
                <EmptyFinalFourMatch />
              </div>
            </div>
          </div>

          {/* Bottom Regions: West and Midwest */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
            <EmptyRegion name="West" direction="ltr" />
            <EmptyRegion name="Midwest" direction="rtl" />
          </div>
        </div>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}

function EmptyRegion({ name, direction = "ltr" }: EmptyRegionProps) {
  const isRtl = direction === "rtl"

  const calculateSpacing = (round: number): number => {
    const baseSpacing = 100
    return round === 1 ? baseSpacing : baseSpacing * Math.pow(2, round - 1)
  }

  // Define the expected matches with a proper type
  const expectedMatches: Record<number, number> = {
    1: 8,
    2: 4,
    3: 2,
    4: 1,
  }

  return (
    <div className="w-full">
      <h3 className={`text-lg font-semibold mb-8 ${direction === "rtl" ? "text-right" : ""}`}>{name}</h3>
      <div className={`flex ${direction === "rtl" ? "gap-[41px] flex-row-reverse pr-[30px]" : "gap-[18px]"}`}>
        {[1, 2, 3, 4].map((round) => {
          const spacing = calculateSpacing(1)
          // Ensure we're using a valid key from expectedMatches
          const matchCount = expectedMatches[round as keyof typeof expectedMatches] || 0
          const matchesInRound = Array(matchCount).fill(null)
          const roundHeight = spacing * 7

          return (
            <div key={round} className="flex-1">
              <div
                className="flex flex-col relative"
                style={{
                  height: roundHeight,
                }}
              >
                {matchesInRound.map((_, index) => {
                  let position: number

                  if (round === 1) {
                    position = index * spacing
                  } else if (round === 2) {
                    position = index * 2 * spacing + spacing * 0.5
                  } else if (round === 3) {
                    position = index * 4 * spacing + 1.5 * spacing
                  } else {
                    position = 3.5 * spacing
                  }

                  return (
                    <div
                      key={`${round}-${index}`}
                      className="absolute w-full"
                      style={{
                        top: position,
                      }}
                    >
                      <EmptyMatch roundIndex={round - 1} direction={direction} />
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function EmptyMatch({ roundIndex, direction = "ltr", isSpecial = false }: EmptyMatchProps) {
  return (
    <Card
      className={`
        w-[100px] sm:w-[150px] h-[70px] sm:h-[80px] flex flex-col justify-center 
        transition-all duration-300 overflow-hidden bg-background
        ${isSpecial ? "w-[140px] sm:w-[200px] h-[90px] sm:h-[100px] shadow-lg" : ""}
      `}
    >
      <CardContent className={`p-0 ${isSpecial ? "p-0" : ""}`}>
        <EmptyTeamInfo position="top" direction={direction} isSpecial={isSpecial} />
        <EmptyTeamInfo position="bottom" direction={direction} isSpecial={isSpecial} />
      </CardContent>
    </Card>
  )
}

function EmptyTeamInfo({ position, direction = "ltr", isSpecial = false }: EmptyTeamInfoProps) {
  return (
    <div
      className={`
        flex items-center space-x-1 px-2 py-0.5 sm:py-1 relative h-[35px] sm:h-[40px] w-full
        ${position === "top" ? "border-b border-border rounded-t-lg" : "rounded-b-lg"}
        ${isSpecial ? "py-1 sm:py-2 h-[45px] sm:h-[50px]" : ""}
      `}
    >
      <div className="flex items-center gap-0.5 flex-1 min-w-0">
        <div
          className={`
            w-2.5 h-2.5 sm:w-4 sm:h-4 relative flex-shrink-0
            ${isSpecial ? "w-3.5 h-3.5 sm:w-5 sm:h-5" : ""}
          `}
        >
          <Skeleton className="w-full h-full rounded-full" />
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <Skeleton className="h-2 sm:h-3 w-full max-w-[80px]" />
          <Skeleton className="h-1.5 sm:h-2 w-3/4 mt-1" />
        </div>
      </div>
    </div>
  )
}

function EmptyFinalFourMatch() {
  return (
    <div className="w-full flex flex-col items-center">
      <div className="relative mb-2 sm:mb-4">
        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-center mb-1 sm:mb-2 bg-gradient-to-r from-yellow-500 via-yellow-300 to-yellow-500 bg-clip-text text-transparent">
          FINAL FOUR
        </h3>
      </div>
      <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-4">Apr 5</p>
      <div className="bg-gradient-to-br from-yellow-100 via-yellow-50 to-white rounded-lg p-3 sm:p-4 lg:p-6 w-full max-w-[250px] shadow-lg relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-200/20 via-yellow-100/10 to-transparent pointer-events-none" />
        <div className="relative z-50 flex justify-center">
          <EmptyMatch roundIndex={4} isSpecial={true} />
        </div>
        <div className="absolute -bottom-6 -right-6 transform rotate-12">
          <Trophy className="text-yellow-300 w-12 sm:w-16 h-12 sm:h-16 opacity-20" />
        </div>
      </div>
    </div>
  )
}

function EmptyChampionshipMatch() {
  return (
    <div className="w-full">
      <div className="flex flex-col items-center">
        <div className="relative mb-2 sm:mb-4">
          <h3 className="text-xl sm:text-3xl lg:text-4xl font-bold text-center mb-1 sm:mb-2 bg-gradient-to-r from-yellow-500 via-yellow-300 to-yellow-500 bg-clip-text text-transparent">
            Championship
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-4">San Antonio, TX</p>
        <div className="bg-gradient-to-br from-yellow-200 via-yellow-100 to-white rounded-lg p-4 sm:p-6 lg:p-8 w-full max-w-[320px] shadow-xl relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-300/40 via-yellow-200/30 to-transparent pointer-events-none" />
          <div className="relative z-10 flex justify-center">
            <EmptyMatch roundIndex={5} isSpecial={true} />
          </div>
          <div className="absolute -bottom-8 -right-8 transform rotate-12">
            <Trophy className="text-yellow-400 w-16 sm:w-24 h-16 sm:h-24 opacity-30" />
          </div>
        </div>
      </div>
    </div>
  )
}


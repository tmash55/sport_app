import { cn } from "@/lib/utils"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
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
  { name: "Final Four", dates: "April 5"},
  { name: "Championship", dates: "April 7"},
  { name: "Final Four", dates: "April 5"},
  { name: "Elite Eight", dates: "March 29-30" },
  { name: "Sweet 16", dates: "March 27-28" },
  { name: "2nd Round", dates: "March 22-23" },
  { name: "1st Round", dates: "March 20-21" },
]

export function BracketHeader() {
    return (
        <div className="w-full border-b mb-4 sm:mb-8">
          <div className="px-4 sm:px-6 py-4 sm:py-6">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">
              Men's NCAA Tournament Bracket 2024-25
            </h1>
            <ScrollArea className="w-full whitespace-nowrap rounded-md border">
              <div className="flex p-4">
                {rounds.map((round, index) => (
                  <div
                    key={`${round.name}-${index}`}
                    className={cn(
                      "flex-shrink-0 flex flex-col items-center text-center px-3 sm:px-4",
                      index === 5 && "px-6 sm:px-8",
                    )}
                  >
                    <span className="text-sm font-medium mb-1">{round.name}</span>
                    <span className="text-xs text-muted-foreground">{round.dates}</span>
                    {round.location && <span className="text-xs text-muted-foreground mt-0.5">{round.location}</span>}
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        </div>
      )
}


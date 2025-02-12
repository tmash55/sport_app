import { cn } from "@/lib/utils"

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

export function BracketHeader() {
  return (
    <div className="w-full">
      <div className="px-2 py-4 md:px-4 md:py-6">
        <h1 className="text-xl font-bold text-[#11274F] dark:text-foreground md:text-2xl lg:text-3xl">
          Men&apos;s NCAA Tournament Bracket 2024-25
        </h1>
        <div className="mt-4 md:mt-6">
          <div className="grid grid-cols-3 gap-1 sm:grid-cols-6 md:grid-cols-11 rounded-md border bg-background">
            {rounds.map((round, index) => (
              <div
                key={`${round.name}-${index}`}
                className={cn(
                  "flex flex-col items-center justify-center p-1 text-center",
                  index === 5 && "border-x border-border/50 bg-primary/5",
                  index >= 6 && "hidden md:flex", // Hide on mobile, show on md and up
                )}
              >
                <span className="text-xs font-semibold text-[#11274F] dark:text-foreground sm:text-sm">
                  {round.name}
                </span>
                <span className="mt-0.5 text-[10px] text-muted-foreground sm:text-xs">{round.dates}</span>
                {round.location && (
                  <span className="mt-0.5 text-[10px] text-muted-foreground sm:text-xs">{round.location}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}


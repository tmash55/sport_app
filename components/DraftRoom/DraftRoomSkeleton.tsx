import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"

const TOTAL_SLOTS = 12 // Adjust this based on your actual number of slots
const TOTAL_ROUNDS = 5 // Adjust this based on your actual number of rounds

export function DraftRoomSkeleton() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <Skeleton className="h-16 w-full" /> {/* DraftHeader skeleton */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 h-[calc(100vh-8rem)] overflow-hidden pt-2">
        <div className="w-full lg:w-[20%] flex flex-col gap-4 overflow-hidden px-2">
          <Card className="lg:h-[140px] relative overflow-hidden">
            <CardContent className="h-full p-3">
              <div className="flex flex-col lg:flex-row h-full">
                <div className="w-full lg:w-1/2 flex flex-col items-center justify-center mb-2 lg:mb-0">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <div className="w-full lg:w-1/2 flex flex-col items-center justify-center lg:border-l lg:border-border">
                  <Skeleton className="h-3 w-16 mb-2" />
                  <Skeleton className="h-5 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="flex-1 overflow-hidden">
            <CardContent className="p-4 h-full">
              <ScrollArea className="h-full">
                {[...Array(10)].map((_, index) => (
                  <div key={index} className="flex items-center space-x-4 mb-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-4 w-[150px]" />
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="w-full lg:w-[80%] flex flex-col gap-4 overflow-hidden pr-2">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <Skeleton className="h-8 w-40" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-8 w-28" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="flex-1 overflow-hidden">
            <CardContent className="p-4 h-full">
              <ScrollArea className="h-full">
                <div className="grid grid-cols-[repeat(12,1fr)] gap-2">
                  {/* Header row */}
                  {[...Array(TOTAL_SLOTS)].map((_, index) => (
                    <div key={`header-${index}`} className="p-2">
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))}

                  {/* Draft board rows */}
                  {[...Array(TOTAL_ROUNDS)].map((_, round) =>
                    [...Array(TOTAL_SLOTS)].map((_, slot) => (
                      <div
                        key={`${round}-${slot}`}
                        className="relative bg-secondary p-2 rounded border border-secondary-foreground/20 overflow-hidden"
                      >
                        <div className="h-20 rounded flex flex-col items-center justify-center p-1">
                          <Skeleton className="h-12 w-12 rounded-full mb-2" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    )),
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


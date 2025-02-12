import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function DraftRoomSkeleton() {
  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="container mx-auto px-4 py-4 flex-1 flex flex-col min-h-0">
        {/* Header Section */}
        <Card className="mb-4">
          <CardHeader className="p-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-48" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Controls Section */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-48" />
            </div>
          </CardContent>
        </Card>

        {/* Recent Pick */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>

        {/* Main Content Area */}
        <div className="flex-1 flex gap-4 min-h-0">
          {/* Main Draft View */}
          <Card className="flex-1">
            <CardContent className="p-4 h-full">
              <Skeleton className="h-full w-full" />
            </CardContent>
          </Card>

          {/* Teams Panel */}
          <Card className="w-80">
            <CardContent className="p-4 h-full">
              <Skeleton className="h-full w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


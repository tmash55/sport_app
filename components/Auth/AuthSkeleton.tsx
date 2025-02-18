import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function AuthSkeleton() {
  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            <Skeleton className="h-8 w-3/4" />
          </CardTitle>
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-4 w-3/4 mx-auto" />
        </CardContent>
      </Card>
    </div>
  )
}



import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trophy, Users, Calendar, Star } from 'lucide-react'

interface PoolCardProps {
  name: string
  sport: string
  participants: number
  startDate: string
  status: "active" | "upcoming" | "completed"
  userRank?: number
  totalTeams?: number
}

export function PoolCard({ name, sport, participants, startDate, status, userRank, totalTeams }: PoolCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{name}</CardTitle>
          <Badge variant={status === "active" ? "default" : status === "upcoming" ? "secondary" : "outline"}>
            {status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Trophy className="h-4 w-4" />
          <span>{sport}</span>
        </div>
        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{participants} participants</span>
        </div>
        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{startDate}</span>
        </div>
        {userRank && totalTeams && (
          <div className="mt-2 flex items-center gap-2 text-sm font-medium text-primary">
            <Star className="h-4 w-4" />
            <span>Your Rank: {userRank}/{totalTeams}</span>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button className="w-full">View Details</Button>
      </CardFooter>
    </Card>
  )
}


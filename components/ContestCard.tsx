import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, Trophy } from 'lucide-react'
import Link from 'next/link'

interface Contest {
  id: string
  name: string
  contest_type: string
  description: string
  sport: string
  max_teams: number
  min_teams: number
  setup_time: string
}

interface ContestCardProps {
  contest: Contest
}

export function ContestCard({ contest }: ContestCardProps) {
  const getIcon = (sport: string) => {
    switch (sport.toLowerCase()) {
      case 'basketball':
        return Trophy
      case 'golf':
        return Trophy
      default:
        return Trophy
    }
  }

  const Icon = getIcon(contest.sport)

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Icon className="w-8 h-8 text-primary" />
          <Badge variant="secondary">{contest.contest_type}</Badge>
        </div>
        <CardTitle className="text-xl">{contest.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground mb-4">{contest.description}</p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Users className="w-4 h-4" />
          <span>{contest.min_teams}–{contest.max_teams} players</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>Setup time: {contest.setup_time}</span>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button asChild variant="outline" className="w-full">
          <Link href={`/contests/${contest.id}/rules`}>More Info</Link>
        </Button>
        <Button asChild className="w-full">
          <Link href={`/contests/${contest.id}/details`}>Select This Contest</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}


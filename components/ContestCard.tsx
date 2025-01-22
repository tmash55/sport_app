import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, Trophy } from 'lucide-react'
import { PiFootballHelmetBold, PiGolf, PiTrophy, PiBasketball } from "react-icons/pi"
import { GiBasketballBasket } from "react-icons/gi"
import { CiBaseball } from "react-icons/ci"
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
  const SportIcon = ({ sport }: { sport: string }) => {
    switch (sport.toLowerCase()) {
      case 'football':
        return <PiFootballHelmetBold className="h-7 w-7" />
      case 'basketball':
        return <PiBasketball className="h-7 w-7" />
      case 'baseball':
        return <CiBaseball className="h-7 w-7" />
      case 'golf':
        return <PiGolf className="h-7 w-7" />
      default:
        return <PiTrophy className="h-7 w-7" />
    }
  }

  const sport = contest?.sport || 'Unknown'

  return (
    <Card className="group flex h-full flex-col transition-all hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
        <SportIcon sport={sport} />
          <Badge variant="secondary" className="transition-colors group-hover:bg-primary/10">
            {contest.contest_type}
          </Badge>
        </div>
        <CardTitle className="text-xl group-hover:text-primary transition-colors">
          {contest.name}
        </CardTitle>
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
        <Button asChild variant="outline" className="w-full group-hover:bg-primary/5 transition-colors">
          <Link href={`/contests/${contest.id}/rules`}>More Info</Link>
        </Button>
        <Button asChild className="w-full">
          <Link href={`/contests/${contest.id}/details`}>Select This Contest</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}


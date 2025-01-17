import { ContestCard } from '@/components/ContestCard'
import { ShoppingBasketIcon as Basketball, GlobeIcon as GolfBall } from 'lucide-react'

const contests = [
  {
    icon: Basketball,
    name: "March Madness Draft Contest",
    format: "Draft-Based Pool",
    description: "Pick teams in a live draft and earn points for wins and upsets!",
    players: "4–12 players",
    setupTime: "~10 minutes",
    moreInfoLink: "/contests/march-madness-rules",
    selectLink: "/contests/march-madness/details",
  },
  {
    icon: GolfBall,
    name: "Masters Draft Contest",
    format: "Draft-Based Pool",
    description: "Draft golfers and compete throughout the prestigious Masters tournament!",
    players: "4–12 players",
    setupTime: "~10 minutes",
    moreInfoLink: "/contests/masters-rules",
    selectLink: "/contests/masters/details",
  },
  // Add more contests here as needed
]

export function ContestSelection() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {contests.map((contest, index) => (
        <ContestCard key={index} {...contest} />
      ))}
    </div>
  )
}


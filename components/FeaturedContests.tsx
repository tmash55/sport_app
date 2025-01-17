import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarIcon, UsersIcon, TrophyIcon, ClubIcon as GolfIcon, ShieldIcon } from 'lucide-react'
import Image from 'next/image'

const otherContests = [
    {
        name: "Masters Golf Pool",
        description: "Draft golfers for a chance to win the green jacket of fantasy sports.",
        icon: GolfIcon,
        status: "Coming April"
      },

  {
    name: "NCAA Pick'em Challenge",
    description: "Predict the winners of each game throughout the tournament.",
    icon: TrophyIcon,
    status: "Coming Next Season"
  },
  {
    name: "NFL Survivor Pool",
    description: "Choose one team to win each week. Last fan standing wins!",
    icon: ShieldIcon,
    status: "Coming Next Season"
  },
  
]

export function FeaturedContests() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4">Featured Contests</h2>
        <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
          From classic formats to innovative new ways to play, DraftPlay offers a variety of contests to keep you engaged all season long.
        </p>
        
        <div className="grid gap-8 max-w-7xl mx-auto">
          {/* March Madness Draft Contest - Highlighted */}
          <Card className="overflow-hidden">
            <div className="grid md:grid-cols-2">
              <CardContent className="p-6 flex flex-col justify-center">
                <Badge className="w-fit mb-2">Featured Contest</Badge>
                <CardTitle className="text-2xl mb-2">March Madness Draft Contest</CardTitle>
                <CardDescription className="mb-4">
                  Experience March Madness like never before! Draft your dream lineup of college teams and compete against friends and rivals in this unique, season-long contest.
                </CardDescription>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Starts: Mar 19, 2025</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UsersIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">1000+ players</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg">Join Contest</Button>
                  <Button size="lg" variant="outline">Learn More</Button>
                </div>
              </CardContent>
              <div className="relative min-h-[200px] md:min-h-full">
                <Image
                  src="/placeholder.svg?height=400&width=600"
                  alt="March Madness Draft Contest"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-r-lg"
                />
              </div>
            </div>
          </Card>

          {/* Other Contests */}
          <div className="grid md:grid-cols-3 gap-8">
            {otherContests.map((contest, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <contest.icon className="w-8 h-8 text-primary" />
                    <Badge variant={contest.status === "Open" ? "default" : "secondary"}>
                      {contest.status}
                    </Badge>
                  </div>
                  <CardTitle className="mt-4">{contest.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{contest.description}</p>
                  <Button variant="outline" className="w-full">Learn More</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarIcon, Users, Trophy, ArrowRight } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { PulseButton } from "./StyledButton"
import Link from "next/link"
import { PiFootballLight as football, PiGolf as golf } from "react-icons/pi";


const otherContests = [
  
  {
    name: "NFL Draft Contest",
    description:
      "Build your lineup from incoming rookies and score points based on their draft positions. A new way to experience the NFL draft.",
    icon: football,
    status: "Coming April",
    highlight: true,
  },
  {
    name: "Golf Majors",
    description:
      "Draft golfers to your team and earn points as they compete for the Trophy. A fresh take on fantasy golf that puts you in control of your roster.",
    icon: golf,
    status: "Coming May",
    highlight: true,
  },
  {
    name: "NCAAF Pick'em Challenge",
    description:
      "Predict the winners of each game throughout the tournament. Classic bracket-style competition with a modern twist.",
    icon: football,
    status: "Coming Next Season",
  },
]

export function FeaturedContests() {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[25%] -left-[10%] w-[40%] aspect-square rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute top-[60%] left-[60%] w-[40%] aspect-square rounded-full bg-secondary/5 blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-6 dark:text-foreground text-[#11274F]">Featured Contests</h2>
          <p className="text-xl text-muted-foreground">
            From classic formats to innovative new ways to play, we offer a variety of contests to keep you engaged all
            season long.
          </p>
        </div>

        <div className="grid gap-8 max-w-7xl mx-auto">
          {/* March Madness Draft Contest - Featured */}
          <Card className="group overflow-hidden border-muted-foreground/10 dark:border-primary/30">
            <div className="grid md:grid-cols-2 gap-6 p-6 md:p-8">
            <CardContent className="p-0 flex flex-col justify-center">
              <Badge className="w-fit mb-4 bg-primary/10 text-primary border-0 rounded-full px-4 py-1">
                Featured Contest
              </Badge>
              <CardTitle className="text-2xl md:text-3xl lg:text-4xl mb-4 dark:text-foreground text-[#11274F]">
                March Madness Draft Contest
              </CardTitle>
              <p className="text-muted-foreground text-lg mb-6">
                Experience March Madness like never before! Create your pool, invite friends, and get ready to draft your dream lineup of college teams once the brackets are set on <strong>Selection Sunday, March 16th</strong>.
              </p>
              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Drafts Open: Mar 16, 2025</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">1000+ players</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <PulseButton size="lg" className="text-lg px-8">
                <Link href="/pools/start">Create Pool</Link>
                </PulseButton>
                <Button size="lg" variant="outline" className="group/btn dark:text-foreground text-[#11274F]">
                <Link href="/how-to-play/march-madness-draft">Learn More</Link>
                  <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform dark:text-foreground text-[#11274F]" />
                </Button>
              </div>
            </CardContent>

              <div className="relative min-h-[300px] md:min-h-full rounded-xl overflow-hidden">
              <Image
                  src="/images/app/hoop_1.jpg"
                  alt="March Madness Draft Pool"
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/30 to-transparent" />
              </div>
            </div>
          </Card>

          {/* Other Contests */}
          <div className="grid md:grid-cols-3 gap-6">
            {otherContests.map((contest, index) => (
              <Card
                key={index}
                className="group relative overflow-hidden border-muted-foreground/10 transition-all duration-300 hover:shadow-lg dark:border-primary/20"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2.5 rounded-xl bg-primary/10">
                      <contest.icon className="w-5 h-5 text-primary" />
                    </div>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "rounded-full px-4 py-1",
                        contest.highlight && "bg-primary/10 text-primary border-0",
                      )}
                    >
                      {contest.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors dark:text-foreground text-[#11274F]">
                    {contest.name}
                  </CardTitle>
                  <p className="text-muted-foreground">{contest.description}</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button variant="ghost" className="w-full group/btn dark:text-foreground text-[#11274F]">
                  <Link href="/how-to-play/march-madness-draft">Learn More</Link>
                    <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform dark:text-foreground text-[#11274F]" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}


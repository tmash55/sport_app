import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Trophy, Users, Star, TrendingUp, UserPlus, UsersRound, Gift } from "lucide-react"
import Link from "next/link"
import { PulseButton } from "./StyledButton"
import Image from "next/image"
import draftBoard1 from "@/public/landing-page/draft-board1.png"
import upset1 from "@/public/landing-page/upset1.png"
import leagueStandings from "@/public/landing-page/league_standings.png"
import teamStandings from "@/public/landing-page/team_standings.png"

const steps = [
  {
    number: "1",
    title: "Create Account",
    description: "Sign up in seconds and create your pools",
    icon: UserPlus,
  },
  {
    number: "2",
    title: "Join or Create Pools",
    description: "Select from various pool types, customize settings",
    icon: UsersRound,
  },
  {
    number: "3",
    title: "Compete & Win",
    description: "Track your progress and climb the leaderboards",
    icon: Gift,
  },
]

const contestFeatures = [
  {
    icon: Trophy,
    title: "Draft Teams",
    description: "Draft your lineup of college basketball teams",
    image: draftBoard1,
    color: "from-blue-500/10 to-blue-500/5",
  },
  {
    icon: Users,
    title: "Compete",
    description: "Compete with friends and other fans",
    image: leagueStandings,
    color: "from-purple-500/10 to-purple-500/5",
  },
  {
    icon: Star,
    title: "Score Points",
    description: "Earn points for each win your teams secure",
    image: teamStandings,
    color: "from-orange-500/10 to-orange-500/5",
  },
  {
    icon: TrendingUp,
    title: "Bonus for Upsets",
    description: "Rack up extra points when underdogs triumph",
    image: upset1,
    color: "from-green-500/10 to-green-500/5",
  },
]

export function AboutContest() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-6 dark:text-foreground text-[#11274F]">
            What is the March Madness Draft Contest?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Experience the thrill of March Madness like never before! Our unique contest combines the strategic depth of
            fantasy sports with the heart-pounding excitement of the NCAA tournament. Draft your dream lineup of college
            teams and ride the rollercoaster of March Madness to victory!
          </p>
        </div>

        {/* Getting Started Steps */}
        <div className="grid md:grid-cols-3 gap-8 mb-24 relative">
          {/* Connecting Lines */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-primary/20">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/40 to-primary/0" />
          </div>

          {steps.map((step, index) => (
            <div key={index} className="relative">
              <Card className="relative h-full bg-gradient-to-b from-muted/50 to-muted border-muted-foreground/10">
                <CardContent className="pt-12 pb-8 px-6 text-center relative">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-primary flex items-center justify-center text-xl font-bold text-primary-foreground">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 dark:text-foreground text-[#11274F]">{step.title}</h3>
                  <p className="text-muted-foreground mb-6">{step.description}</p>
                  <step.icon className="w-12 h-12 mx-auto text-primary opacity-80" />
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Contest Features */}
        <div className="mb-16">
          <h3 className="text-2xl font-semibold mb-8 dark:text-foreground text-[#11274F]">How It Works</h3>
          <div className="grid sm:grid-cols-2 gap-6">
            {" "}
            {/* Updated grid layout */}
            {contestFeatures.map((feature, index) => (
              <Card
                key={index}
                className="group overflow-hidden border-muted-foreground/10 transition-all duration-300 hover:shadow-lg"
              >
                <CardContent className="p-0">
                  <div className="relative aspect-[16/9] w-full">
                    {" "}
                    {/* Updated aspect ratio */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.color}`} />
                    <Image
                      src={feature.image || "/placeholder.svg"}
                      alt={feature.title}
                      fill
                      className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-8">
                    {" "}
                    {/* Updated padding */}
                    <div className="flex items-center gap-4 mb-4">
                      {" "}
                      {/* Updated margin */}
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-primary-foreground">
                        <feature.icon className="h-6 w-6" />
                      </div>
                      <h4 className="text-xl font-semibold group-hover:text-primary transition-colors duration-300 dark:text-foreground text-[#11274F]">
                        {feature.title}
                      </h4>
                    </div>
                    <p className="text-base text-muted-foreground">{feature.description}</p> {/* Updated text size */}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex justify-center gap-6">
          <Button size="lg" variant="outline" className="text-lg px-8 dark:text-foreground text-[#11274F]">
            <Link href="/how-to-play/march-madness-draft">View Rules</Link>
          </Button>
          <PulseButton size="lg" className="text-lg px-8">
            <Link href="/pools/start">Create Now!</Link>
          </PulseButton>
        </div>
      </div>
    </section>
  )
}


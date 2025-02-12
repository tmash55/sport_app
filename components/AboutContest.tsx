import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Trophy, Users, Star, TrendingUp, UserPlus, UsersRound, Gift } from "lucide-react"
import Link from "next/link"
import { PulseButton } from "./StyledButton"


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
  { icon: Trophy, title: "Draft Teams", description: "Draft your lineup of college basketball teams" },
  { icon: Users, title: "Compete", description: "Compete with friends and other fans" },
  { icon: Star, title: "Score Points", description: "Earn points for each win your teams secure" },
  { icon: TrendingUp, title: "Bonus for Upsets", description: "Rack up extra points when underdogs triumph" },
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
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold mb-6 dark:text-foreground text-[#11274F]">How It Works</h3>
            <div className="grid gap-4">
              {contestFeatures.map((feature, index) => (
                <Card
                  key={index}
                  className="group relative overflow-hidden border-muted-foreground/10 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 dark:border-primary/20"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <CardContent className="flex items-center gap-6 p-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full transform group-hover:scale-125 transition-transform duration-300" />
                      <div className="relative h-14 w-14 rounded-xl bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-primary-foreground shadow-lg">
                        <feature.icon className="h-7 w-7" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors duration-300 dark:text-foreground text-[#11274F]">
                        {feature.title}
                      </h4>
                      <p className="text-muted-foreground text-sm">{feature.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative w-full aspect-video bg-muted rounded-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
              <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-primary">
                Contest Explainer Video
              </div>
            </div>
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


import { Lightbulb, Users, Trophy } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

const steps = [
  {
    icon: Lightbulb,
    title: "Choose Your Contest",
    description: "Browse through our wide range of sports contests and pick the one that excites you the most."
  },
  {
    icon: Users,
    title: "Invite Your Friends",
    description: "Create a league and invite your friends to join. The more, the merrier!"
  },
  {
    icon: Trophy,
    title: "Compete in Contests",
    description: "Draft your dream team, watch them perform in real-time, and climb the leaderboard in your league."
  }
]

export function HowItWorks() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <Card 
              key={index} 
              className="group flex flex-col items-center text-center transition-all hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1"
            >
              <CardHeader>
                <div className="bg-primary/10 text-primary rounded-full p-3 mb-4 transition-transform group-hover:scale-110">
                  <step.icon className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  {step.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}


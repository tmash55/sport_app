import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Users, ClipboardList, Trophy } from 'lucide-react'
import Image from 'next/image'

const steps = [
  {
    title: "Create or Join a Pool",
    description: "Set up your own pool or join an existing one with friends or other fans.",
    icon: Users,
    image: "/placeholder.svg?height=200&width=300"
  },
  {
    title: "Draft or Make Your Picks",
    description: "Use our intuitive interface to draft teams or make your bracket selections.",
    icon: ClipboardList,
    image: "/placeholder.svg?height=200&width=300"
  },
  {
    title: "Compete and Win",
    description: "Track your score, climb the rankings, and win exciting rewards!",
    icon: Trophy,
    image: "/placeholder.svg?height=200&width=300"
  }
]

export function StepsSection() {
  return (
    <section className="py-16 bg-muted">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works in 3 Easy Steps</h2>
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {steps.map((step, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                    <step.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-center mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-center mb-4">{step.description}</p>
                <div className="relative h-40 mb-4">
                  <Image
                    src={step.image || "/placeholder.svg"}
                    alt={step.title}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-md"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center">
          <Button size="lg">Sign Up and Start Playing Now!</Button>
        </div>
      </div>
    </section>
  )
}


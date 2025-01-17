import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Trophy, Users, Star, TrendingUp } from 'lucide-react'

export function AboutContest() {
  const contestFeatures = [
    { icon: Trophy, title: "Draft Teams", description: "Select your dream lineup of college basketball teams" },
    { icon: Users, title: "Compete", description: "Go head-to-head with friends and other fans" },
    { icon: Star, title: "Score Points", description: "Earn points for each win your teams secure" },
    { icon: TrendingUp, title: "Bonus for Upsets", description: "Rack up extra points when underdogs triumph" },
  ]

  return (
    <section className="py-16 bg-muted">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">What is the March Madness Draft Contest?</h2>
        <p className="text-center text-lg text-muted-foreground mb-12 max-w-3xl mx-auto">
          Experience the thrill of March Madness like never before! Our unique contest combines the strategic depth of fantasy sports 
          with the heart-pounding excitement of the NCAA tournament. Draft your dream lineup of college teams and ride the rollercoaster 
          of March Madness to victory!
        </p>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold mb-4">How It Works</h3>
            <div className="grid gap-4">
              {contestFeatures.map((feature, index) => (
                <Card key={index}>
                  <CardContent className="flex items-center p-4">
                    <feature.icon className="h-8 w-8 text-primary mr-4" />
                    <div>
                      <h4 className="font-semibold">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative w-full max-w-md aspect-video">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg" />
              {/* Replace this div with an actual video or infographic */}
              <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-primary">
                Contest Explainer Video
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <Button variant="outline">View Full Rules</Button>
          <Button>Join Now</Button>
        </div>
      </div>
    </section>
  )
}


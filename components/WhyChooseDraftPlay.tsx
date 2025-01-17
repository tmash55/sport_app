import { Card, CardContent } from "@/components/ui/card"
import { Lightbulb, Sliders, Dumbbell, Layout } from 'lucide-react'

const features = [
  {
    icon: Lightbulb,
    title: "Innovative Formats",
    description: "Unique contests like the March Madness Draft Contest"
  },
  {
    icon: Sliders,
    title: "Customizable Pools",
    description: "Tailor rules and scoring to your group"
  },
  {
    icon: Dumbbell,
    title: "Multi-Sport Support",
    description: "Pick from various sports contests"
  },
  {
    icon: Layout,
    title: "Sleek User Experience",
    description: "Modern and easy-to-use dashboard"
  }
]

export function WhyChooseDraftPlay() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose DraftPlay?</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index}>
              <CardContent className="p-6 flex flex-col items-center text-center">
                <feature.icon className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}


import { Clock, Users, BarChart3, Rocket, Layers, LayoutGrid, Settings } from "lucide-react"

const features = [
  {
    title: "Create a Pool in Seconds",
    description: " No complicated setup—just create your pool, invite friends, and start drafting in minutes.",
    icon: Rocket,
  },
  {
    title: "Fully Customizable Pools",
    description: "Pool Commissioners get complete control—set rules, scoring, draft style, and more.",
    icon: Settings,
  },
  {
    title: "Real-Time Game & Pool Updates",
    description: " Track scores, standings, and player performance in real time as the madness unfolds.",
    icon: Clock,
  },
  {
    title: "No Busted Brackets!",
    description: "Unlike traditional brackets, you’re in control—draft teams and score points as they advance.",
    icon: BarChart3,
  },
  {
    title: "Dynamic Draft Rooms",
    description: "Live draft countdowns, auto-pick options, and real-time selections.",
    icon: Layers,
  },
  {
    title: "Multi-Pool Entry & Tracking",
    description: "Join multiple contests and keep up with all your standings.",
    icon: LayoutGrid,
  },
]

export function Features() {
  return (
    <section className="py-24 bg-background">
      <div className="container px-4 md:px-6">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl dark:text-foreground text-[#11274F]">
            Why Players Love Our Pools
          </h2>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
            Join thousands of players who trust our platform for their March Madness pools.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="relative group rounded-3xl p-6 bg-gradient-to-b from-muted/50 to-muted backdrop-blur-sm hover:bg-muted transition-all duration-300"
            >
              <div className="relative z-10 space-y-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold dark:text-foreground text-[#11274F]">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}


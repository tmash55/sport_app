"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Lightbulb, Sliders, Dumbbell, Layout, Smartphone, Trophy } from "lucide-react"
import { motion } from "framer-motion"

const features = [
  {
    icon: Lightbulb,
    title: "Innovative Pool Formats",
    description: "Revolutionary contest formats that change how you experience March Madness and beyond",
  },
  {
    icon: Trophy,
    title: "Dynamic Competitions",
    description: "Engaging tournaments with real-time updates and live scoring across all devices",
  },
  {
    icon: Sliders,
    title: "Customizable Experiences",
    description: "Create and join pools with custom rules, scoring, and draft formats",
  },
  {
    icon: Smartphone,
    title: "Mobile-First Design",
    description: "Seamlessly manage your pools from any device, anywhere, anytime",
  },
  {
    icon: Dumbbell,
    title: "Expanding Sports Selection",
    description: "NFL, MLB and Golf pools are on the way—stay tuned for even more ways to play",
  },
  {
    icon: Layout,
    title: "Modern Interface",
    description: "Intuitive dashboard with real-time updates and easy navigation",
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function WhyChooseDryft() {
  return (
    <section className="relative overflow-hidden bg-background py-24">
      {/* Grid background - visible only in dark mode */}
      <div className="absolute inset-0 dark:block hidden">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_120%,transparent_70%,#000_100%)]" />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" aria-hidden="true" />

      <div className="relative container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">Why Choose dryft?</h2>
          <p className="text-lg text-muted-foreground">
            Experience the future of sports pools with our innovative platform
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={item}>
              <Card className="group relative overflow-hidden bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-all duration-300 hover:scale-105">
                <CardContent className="p-6 sm:p-8">
                  <div className="mb-6 inline-flex items-center justify-center rounded-lg bg-primary/10 p-3 group-hover:bg-primary/20 transition-colors duration-300">
                    <feature.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}


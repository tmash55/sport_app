"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Quote } from "lucide-react"
import { motion } from "framer-motion"

const testimonials = [
  {
    quote: "dryft's March Madness Draft Pool took my love for college basketball to a whole new level!",
    author: "Sarah K.",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    quote: "The unique format kept me engaged throughout the entire tournament. Can't wait for next year!",
    author: "Mike R.",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    quote: "I've never had so much fun watching March Madness. The draft format is genius!",
    author: "Chris L.",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export function Testimonials() {
  return (
    <section className="bg-background relative overflow-hidden py-24">
       {/* Background Elements */}
       <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[25%] -left-[10%] w-[40%] aspect-square rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute top-[60%] left-[60%] w-[40%] aspect-square rounded-full bg-secondary/5 blur-[100px]" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-6 dark:text-foreground text-[#11274F]">
            See What Customers Are Saying
          </h2>
          <p className="text-lg text-muted-foreground">Players Are Loving dryft sports pools—Be Part of the Action!</p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div key={index} variants={item}>
              <Card className="group relative overflow-hidden bg-background/60 dark:bg-background/40 backdrop-blur-sm hover:bg-background/80 dark:hover:bg-background/60 transition-colors border-primary/10 hover:border-primary/20">
                <CardContent className="p-6 sm:p-8">
                  <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-30 transition-opacity">
                    <Quote className="w-12 h-12 text-primary rotate-180" />
                  </div>
                  <Quote className="w-8 h-8 text-primary mb-4" />
                  <p className="mb-6 text-lg leading-relaxed">{testimonial.quote}</p>
                  <div className="flex items-center gap-3">
                    <Avatar className="border-2 border-primary/20">
                      <AvatarImage src={testimonial.avatar} alt={testimonial.author} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {testimonial.author
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-semibold tracking-tight">{testimonial.author}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}


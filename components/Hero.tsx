"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { DeviceFrame } from "./device-frame"
import { PulseButton } from "./StyledButton"
import { motion } from "framer-motion"
import Link from "next/link"

export function Hero() {
  return (
    <div className="relative overflow-hidden bg-background">
      {/* Enhanced Gradient Circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[25%] -left-[10%] w-[40%] aspect-square rounded-full bg-primary/10 blur-[100px] animate-pulse-slow" />
        <div className="absolute top-[60%] left-[60%] w-[40%] aspect-square rounded-full bg-secondary/10 blur-[100px] animate-pulse-slow animation-delay-2000" />
        <div className="absolute top-[20%] -right-[15%] w-[35%] aspect-square rounded-full bg-primary/5 blur-[100px] animate-pulse-slow animation-delay-4000" />
        <div className="absolute -bottom-[10%] -left-[20%] w-[50%] aspect-square rounded-full bg-secondary/5 blur-[100px] animate-pulse-slow animation-delay-6000" />
      </div>

      {/* Grid background - visible only in dark mode */}
      <div className="absolute inset-0 dark:block hidden">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
      </div>

      {/* Enhanced Gradient overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-primary/20 animate-gradient-x"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-40">
        <div className="flex min-h-[80vh] flex-col items-center justify-center text-center space-y-10">
          <motion.h1
            className="text-4xl font-extrabold tracking-tight dark:text-foreground text-[#11274F] sm:text-5xl md:text-6xl lg:text-7xl max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-primary">March Madness,</span> Reimagined:{" "}
            <span className="text-primary">Draft.</span> Compete. Win.
          </motion.h1>

          <motion.p
            className="mt-6 text-xl text-max-w-2xl mx-auto dark:text-foreground/90 text-[#11274F]/90"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            The strategy of fantasy sports meets the thrill of March Madness. Draft teams, track wins, and score big!
          </motion.p>

          <motion.p
            className="mt-4 text-xl font-medium text-primary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Ditch the Bracket. Build Your Squad. Chase the Madness!
          </motion.p>

          <motion.div
            className="mt-12 flex flex-col sm:flex-row gap-6 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <PulseButton size="lg" className="text-lg px-8 py-4 text-white">
            <Link href="/pools/start">Create a Pool Now</Link>
            </PulseButton>
            <Button size="lg" variant="outline" className="text-lg px-8 py-4 group dark:text-foreground text-[#11274F]">
            <Link href="/how-to-play/march-madness-draft">Learn More</Link>
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform dark:text-foreground text-[#11274F]" />
            </Button>
          </motion.div>

          {/* Device Frame */}
          <motion.div
            className="mt-20 w-full px-4 sm:px-6 lg:px-8 pb-16 pt-6"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <DeviceFrame src="/placeholder.svg?height=750&width=1200" alt="Dryft Application Interface" />
          </motion.div>
        </div>
      </div>
    </div>
  )
}


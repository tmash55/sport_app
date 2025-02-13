"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { PulseButton } from "./StyledButton"
import Link from "next/link"
import Image from "next/image"

export function Hero() {
  return (
    <div className="relative overflow-hidden bg-background">
      {/* Enhanced Gradient Circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[25%] -left-[10%] w-[40%] aspect-square rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute top-[60%] left-[60%] w-[40%] aspect-square rounded-full bg-secondary/10 blur-[100px]" />
        <div className="absolute top-[20%] -right-[15%] w-[35%] aspect-square rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute -bottom-[10%] -left-[20%] w-[50%] aspect-square rounded-full bg-secondary/5 blur-[100px]" />
      </div>

      {/* Grid background - visible only in dark mode */}
      <div className="absolute inset-0 dark:block hidden">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
      </div>

      {/* Enhanced Gradient overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-primary/20"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-20">
        <div className="flex min-h-[80vh] flex-col items-center justify-center text-center space-y-12">
          <h1 className="text-5xl font-extrabold tracking-tight dark:text-foreground text-[#11274F] sm:text-6xl md:text-7xl lg:text-8xl max-w-4xl mx-auto">
            <span className="text-primary">March Madness,</span> Reimagined:{" "}
            <span className="text-primary">Draft.</span> Compete. Win.
          </h1>

          <p className="text-xl font-medium text-primary max-w-2xl">
            Ditch the Bracket. Build Your Squad. Chase the Madness!
          </p>

          <div className="w-full max-w-md flex flex-col gap-4">
            <PulseButton size="lg" className="w-full text-lg px-8 py-6 text-white">
              <Link href="/pools/start" className="w-full">
                Create a Free Pool
              </Link>
            </PulseButton>
            <Button
              size="lg"
              variant="outline"
              className="w-full text-lg px-8 py-6 group dark:text-foreground text-[#11274F]"
            >
              <Link href="/how-to-play/march-madness-draft" className="w-full flex items-center justify-center">
                Learn More
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform dark:text-foreground text-[#11274F]" />
              </Link>
            </Button>
          </div>

          <div className="w-full max-w-5xl mt-16">
            <Image
              src="/placeholder.svg?height=750&width=1200"
              alt="Dryft Application Interface"
              width={1200}
              height={750}
              className="w-full rounded-lg shadow-2xl"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  )
}


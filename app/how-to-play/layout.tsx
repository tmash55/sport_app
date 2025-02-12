import type React from "react"
import { Navigation } from "@/components/Navigation"
import { Footer } from "@/components/Footer"

export default function HowToPlayLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navigation />
      <div className="relative overflow-hidden bg-background min-h-screen pt-24">
        {/* Enhanced Gradient Circles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-[25%] -left-[10%] w-[40%] aspect-square rounded-full bg-primary/10 blur-[100px]" />
          <div className="absolute top-[60%] left-[60%] w-[40%] aspect-square rounded-full bg-secondary/10 blur-[100px" />
          <div className="absolute top-[20%] -right-[15%] w-[35%] aspect-square rounded-full bg-primary/5 blur-[100px]" />
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

        <div className="relative">
          <div className="container mx-auto px-4 py-8">
            <div className="prose prose-lg dark:prose-invert max-w-none">{children}</div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}


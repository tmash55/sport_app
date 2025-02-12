import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PulseButton } from "./StyledButton"

export function CallToAction() {
  return (
    <section className="relative overflow-hidden border-t">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/30 to-primary/10" />
      <div className="container relative mx-auto px-4 py-16 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Ready for March Madness?</h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Join the most exciting fantasy basketball experience of the year!
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <PulseButton asChild size="lg" className="min-w-[200px] font-semibold">
              <Link href="/pools/start">Create Your Pool</Link>
            </PulseButton>
            <Button asChild size="lg" variant="secondary" className="min-w-[200px] font-semibold">
            <Link href="/how-to-play/march-madness-draft">How To Play</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}


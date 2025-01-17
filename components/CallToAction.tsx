import { Button } from "@/components/ui/button"
import Link from "next/link"

export function CallToAction() {
  return (
    <section className="py-16 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold mb-4">Ready for March Madness?</h2>
        <p className="text-xl mb-8">Join the most exciting fantasy basketball experience of the year!</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 text-primary-foreground">
          <Button asChild size="lg" variant="secondary">
            <Link href="/sign-up">Create Your Contest</Link>
          </Button>
          <Button asChild size="lg" variant="link" className="text-primary-foreground">
            <Link href="/how-it-works">Learn Draft Rules</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}


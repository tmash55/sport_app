import { TableHeader } from "@/components/ui/table"
import { CheckCircle, BarChart3, Settings, Users, LineChart, Smartphone, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table"
import { getSEOTags } from "@/libs/seo"
import Link from "next/link"

export const metadata = getSEOTags({
  title: "Pool Pricing | March Madness 2025",
  description: "Pricing information for March Madness 2025 fantasy draft pools",
})

export default function PricingPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8 sm:mb-16">
        <h1 className="text-3xl font-extrabold tracking-tight dark:text-foreground text-[#11274F] sm:text-4xl md:text-5xl lg:text-6xl mb-4 sm:mb-6">
          Simple, Transparent <span className="text-primary">Pricing</span>
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
          Create multiple pools and save. No hidden fees, just pure basketball excitement for March Madness 2025.
        </p>
      </div>

      <Card className="mb-16">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Pool Pricing Structure</CardTitle>
          <CardDescription>The price per pool decreases as you create more pools.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="text-left sm:text-center">Number of Pools</TableHead>
                <TableHead className="text-right sm:text-center">Price per Pool</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="text-left sm:text-center">First Pool</TableCell>
                <TableCell className="text-right sm:text-center">$30</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-left sm:text-center">Pools 2-5</TableCell>
                <TableCell className="text-right sm:text-center">$25</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-left sm:text-center">6+ Pools</TableCell>
                <TableCell className="text-right sm:text-center">$20</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <div className="mt-6">
            <p className="text-sm text-muted-foreground text-center">
              * Prices are per pool. Each pool fee is paid once by the commissioner and covers the entire 2025 March
              Madness tournament.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-center gap-4 ">
          <Button size="lg"><Link href="/pools/937fb772-f0c7-449f-a639-8d9b44a24f80/details" className="flex items-center gap-2">Create Your Pool Now</Link></Button>
        </CardFooter>
      </Card>

      <Card className="mb-16">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Everything You Need to Run Your Pool</CardTitle>
          <CardDescription className="text-center">Powerful features included with every pool</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Free Pool Creation</h3>
                  <p className="text-sm text-muted-foreground">Set up your league in minutes at no cost</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Live Leaderboards</h3>
                  <p className="text-sm text-muted-foreground">Track standings in real time</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Settings className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Custom Pool Settings</h3>
                  <p className="text-sm text-muted-foreground">Tailor your league with unique rules and settings</p>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Draft Experience</h3>
                  <p className="text-sm text-muted-foreground">Run a live draft with real-time picks and strategy</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <LineChart className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Live Bracket Updates</h3>
                  <p className="text-sm text-muted-foreground">Follow the tournament as teams advance</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Smartphone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Mobile-Friendly Access</h3>
                  <p className="text-sm text-muted-foreground">Stay connected on any device</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mb-8 sm:mb-16">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full">
          {[
            {
              question: "What's included in the pool fee?",
              answer:
                "The pool fee covers access to all post-draft tools including live updates, standings, live bracket, and more for the entire 2025 March Madness tournament.",
            },
            {
              question: "Who pays the pool fee?",
              answer:
                "Only the commissioner pays the pool fee once per pool. It covers the entire tournament for all participants in that pool.",
            },
            {
              question: "Is creating a pool free?",
              answer:
                "Yes, creating a pool and running your draft is completely free. The fee is only for accessing post-draft tools and features.",
            },
            {
              question: "How does the multi-pool discount work?",
              answer:
                "The price per pool decreases as you create more pools. Your first pool is $30, pools 2-5 are $25 each, and any pool beyond that is $20 each.",
            },
          ].map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">Ready to start your March Madness pool?</h2>
        <Button asChild size="lg" className="text-base sm:text-lg px-6 sm:px-8">
          <Link href="/pools/937fb772-f0c7-449f-a639-8d9b44a24f80/details" className="flex items-center gap-2">
            Create Your Pool Now
            <ChevronRight className="h-5 w-5" />
          </Link>
        </Button>
      </div>
    </div>
  )
}


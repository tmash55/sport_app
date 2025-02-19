import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, ChevronRight, Info, Zap, HelpCircle } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Link from "next/link"

export default function NFLDraftHowToPlay() {
  return (
    <article className="max-w-5xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold tracking-tight dark:text-foreground text-[#11274F] sm:text-5xl md:text-6xl mb-6">
          Coming Soon: <span className="text-primary">NFL Draft Pool</span>
        </h1>
        <p className="text-xl text-muted-foreground">Get ready for an exciting new way to experience the NFL Draft!</p>
      </div>

      <div className="grid gap-8 mb-16">
        <Card className="bg-background/60 dark:bg-background/40 backdrop-blur-sm hover:bg-background/80 dark:hover:bg-background/60 transition-colors border-primary/10">
          <CardContent className="p-6 sm:p-8">
            <h2 className="text-2xl font-bold mb-4 dark:text-foreground text-[#11274F] flex items-center gap-2">
              <Trophy className="h-6 w-6 text-primary" />
              Overview
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              Our NFL Draft Pool will bring the excitement of the NFL Draft to your friend group or office. Instead of
              just watching the draft, you'll be competing to build the best team of rookies.
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Draft rookie players in a snake-style draft format.</li>
              <li>Earn points based on your players' actual NFL Draft positions.</li>
              <li>Compete against friends in a dynamic, engaging format that lasts throughout the entire NFL Draft.</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-background/60 dark:bg-background/40 backdrop-blur-sm hover:bg-background/80 dark:hover:bg-background/60 transition-colors border-primary/10">
          <CardContent className="p-6 sm:p-8">
            <h2 className="text-2xl font-bold mb-4 dark:text-foreground text-[#11274F] flex items-center gap-2">
              <Info className="h-6 w-6 text-primary" />
              More Details Coming Soon
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              We're working hard to bring you an immersive NFL Draft experience. Stay tuned for more information about:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4 text-primary" />
                <span>Detailed scoring system</span>
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4 text-primary" />
                <span>Draft settings and strategies</span>
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4 text-primary" />
                <span>Unique features of our NFL Draft Pool</span>
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4 text-primary" />
                <span>How to create and join pools</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-background/60 dark:bg-background/40 backdrop-blur-sm hover:bg-background/80 dark:hover:bg-background/60 transition-colors border-primary/10">
          <CardContent className="p-6 sm:p-8">
            <h2 className="text-2xl font-bold mb-4 dark:text-foreground text-[#11274F] flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              Why You'll Love It
            </h2>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4 text-primary" />
                <span>
                  <strong>Engaging Format:</strong> Stay involved throughout all rounds of the NFL Draft.
                </span>
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4 text-primary" />
                <span>
                  <strong>Strategic Depth:</strong> Balance between drafting top prospects and finding late-round
                  steals.
                </span>
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4 text-primary" />
                <span>
                  <strong>Real-time Updates:</strong> Watch your score change as each pick is announced.
                </span>
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4 text-primary" />
                <span>
                  <strong>Social Experience:</strong> Compete and chat with friends throughout the draft.
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-background/60 dark:bg-background/40 backdrop-blur-sm hover:bg-background/80 dark:hover:bg-background/60 transition-colors border-primary/10">
          <CardContent className="p-6 sm:p-8">
            <h2 className="text-2xl font-bold mb-4 dark:text-foreground text-[#11274F] flex items-center gap-2">
              <HelpCircle className="h-6 w-6 text-primary" />
              FAQ
            </h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-lg font-semibold dark:text-foreground text-[#11274F]">
                  When will the NFL Draft Pool be available?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  We're aiming to launch our NFL Draft Pool feature in time for the upcoming NFL Draft in April. Stay
                  tuned for the exact launch date!
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-lg font-semibold dark:text-foreground text-[#11274F]">
                  How will scoring work?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  We're finalizing the details of our scoring system. It will likely be based on the actual draft
                  positions of your selected players, with bonuses for accurately predicting draft order.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger className="text-lg font-semibold dark:text-foreground text-[#11274F]">
                  Can I create a private pool for my friends or office?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes, you'll be able to create both public and private pools. More details on pool creation and
                  management will be available soon.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>

      <div className="text-center pb-6">
        <h2 className="text-2xl font-bold mb-4 dark:text-foreground text-[#11274F]">Stay Updated</h2>
        <p className="text-lg text-muted-foreground mb-8">
          Don't miss out on the launch of our NFL Draft Pool. Sign up for updates and be the first to know when it's
          live!
        </p>
        <Button asChild size="lg" className="text-lg px-8">
          <Link href="/nfl-draft-updates" className="flex items-center gap-2">
            Get Notified
            <ChevronRight className="h-5 w-5" />
          </Link>
        </Button>
      </div>
    </article>
  )
}


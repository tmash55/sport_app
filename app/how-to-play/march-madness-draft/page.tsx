import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, Users, Star, ChevronRight, Info, Zap, DollarSign, HelpCircle, Clock } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Link from "next/link"

export default function MarchMadnessHowToPlay() {
  return (
    <article className="max-w-5xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold tracking-tight dark:text-foreground text-[#11274F] sm:text-5xl md:text-6xl mb-6">
          How to Play: <span className="text-primary">March Madness Draft Pool</span>
        </h1>
      </div>

      <div className="grid gap-8 mb-16">
        <Card className="bg-background/60 dark:bg-background/40 backdrop-blur-sm hover:bg-background/80 dark:hover:bg-background/60 transition-colors border-primary/10">
          <CardContent className="p-6 sm:p-8">
            <h2 className="text-2xl font-bold mb-4 dark:text-foreground text-[#11274F] flex items-center gap-2">
              <Trophy className="h-6 w-6 text-primary" />
              Overview
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              The March Madness Draft Pool combines the thrill of fantasy sports with the chaos and excitement of March
              Madness. Instead of filling out a traditional bracket, you draft teams and compete for points as the
              tournament unfolds.
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Each team can only be drafted once, making strategic picks crucial.</li>
              <li>Cheer for your teams throughout the tournament with live, up-to-date standings and scoring.</li>
              <li>Compete against your friends in a dynamic and engaging way—no more one-and-done brackets!</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-background/60 dark:bg-background/40 backdrop-blur-sm hover:bg-background/80 dark:hover:bg-background/60 transition-colors border-primary/10">
          <CardContent className="p-6 sm:p-8">
            <h2 className="text-2xl font-bold mb-4 dark:text-foreground text-[#11274F] flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              How to Play
            </h2>
            <ol className="space-y-4 text-lg text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm">
                  1
                </span>
                <span className="mt-0.5">
                  <strong>Join or Create a Pool</strong> – Start a private or public pool and invite friends.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm">
                  2
                </span>
                <span className="mt-0.5">
                  <strong>Invite Your Friends</strong> – Share the invite link and build your competition.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm">
                  3
                </span>
                <span className="mt-0.5">
                  <strong>Live Draft with Pool Members</strong> – Each member selects teams in a snake-style draft.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm">
                  4
                </span>
                <span className="mt-0.5">
                  <strong>Sit Back and Watch the Madness</strong> – Track live standings and scores as games are
                  completed.
                </span>
              </li>
            </ol>
            <p className="mt-4 text-lg font-semibold text-primary">
              The team that racks up the most points wins the pool!
            </p>
          </CardContent>
        </Card>

        <Card className="bg-background/60 dark:bg-background/40 backdrop-blur-sm hover:bg-background/80 dark:hover:bg-background/60 transition-colors border-primary/10">
          <CardContent className="p-6 sm:p-8">
            <h2 className="text-2xl font-bold mb-4 dark:text-foreground text-[#11274F] flex items-center gap-2">
              <Star className="h-6 w-6 text-primary" />
              Scoring System
            </h2>
            <div className="grid sm:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-3 dark:text-foreground text-[#11274F]">Default Scoring</h3>
                <p className="mb-2 text-muted-foreground">
                  Your teams earn points for each win, increasing each round:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex justify-between">
                    <span>Round 1</span>
                    <span className="font-medium text-primary">1 point per win</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Round 2</span>
                    <span className="font-medium text-primary">2 points per win</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Round 3 (Sweet 16)</span>
                    <span className="font-medium text-primary">4 points per win</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Round 4 (Elite 8)</span>
                    <span className="font-medium text-primary">8 points per win</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Round 5 (Final Four)</span>
                    <span className="font-medium text-primary">16 points per win</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Round 6 (Championship)</span>
                    <span className="font-medium text-primary">32 points per win</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3 dark:text-foreground text-[#11274F]">Upset Bonus</h3>
                <p className="text-muted-foreground mb-2">
                  By default, you earn 1 extra point per seed difference when a lower seed beats a higher seed.
                </p>
                <p className="text-muted-foreground mb-4">
                  Example: If a #12 seed defeats a #5 seed, you get 7 bonus points (12 - 5 = 7).
                </p>
                <p className="text-muted-foreground">
                  <strong>Customization:</strong> The Pool Commissioner can adjust the scoring system and upset
                  multiplier to fit your preferred play style.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-background/60 dark:bg-background/40 backdrop-blur-sm hover:bg-background/80 dark:hover:bg-background/60 transition-colors border-primary/10">
          <CardContent className="p-6 sm:p-8">
            <h2 className="text-2xl font-bold mb-4 dark:text-foreground text-[#11274F] flex items-center gap-2">
              <Clock className="h-6 w-6 text-primary" />
              Draft Settings
            </h2>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4 text-primary" />
                <span>
                  <strong>Draft Timer</strong> – The Pool Commissioner sets the draft timer duration, controlling how long
                each player has to make their pick. If the user does not make the pick in the time limit they will get auto drafted a team.
                </span>
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4 text-primary" />
                <span>
                  <strong>Commissioner Control</strong> – The Commissioner has the power to pause and resume the draft at
                any time, allowing for flexibility in managing the draft process.
                </span>
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4 text-primary" />
                <span>
                  <strong>No Trades</strong> – Once a team is drafted, it cannot be traded or swapped. This rule ensures
                fairness and simplifies pool management.
                </span>
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4 text-primary" />
                <span>
                  <strong>Season-Long Commitment</strong> – The teams you draft are yours for the entire tournament. Choose
                wisely, as your selections will impact your entire pool experience!
                </span>
              </li>
            </ul>
            
          </CardContent>
        </Card>

        <Card className="bg-background/60 dark:bg-background/40 backdrop-blur-sm hover:bg-background/80 dark:hover:bg-background/60 transition-colors border-primary/10">
          <CardContent className="p-6 sm:p-8">
            <h2 className="text-2xl font-bold mb-4 dark:text-foreground text-[#11274F] flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              Features
            </h2>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4 text-primary" />
                <span>
                  <strong>Live Draft</strong> – Experience a real-time draft with your pool members.
                </span>
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4 text-primary" />
                <span>
                  <strong>Up-to-Date Scoreboards</strong> – Track your team&apos;s progress and ranking throughout the
                  tournament.
                </span>
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4 text-primary" />
                <span>
                  <strong>Bracket View</strong> – A visual representation of the bracket, showing which pool members own
                  each team.
                </span>
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4 text-primary" />
                <span>
                  <strong>Team Performance Standings</strong> – Easily see which teams are earning the most points.
                </span>
              </li>
            </ul>
            <p className="mt-4 text-lg font-semibold text-primary">
              This isn&apos;t just a bracket pool—it&apos;s a fully immersive experience!
            </p>
          </CardContent>
        </Card>

        <Card className="bg-background/60 dark:bg-background/40 backdrop-blur-sm hover:bg-background/80 dark:hover:bg-background/60 transition-colors border-primary/10">
          <CardContent className="p-6 sm:p-8">
            <h2 className="text-2xl font-bold mb-4 dark:text-foreground text-[#11274F] flex items-center gap-2">
              <Info className="h-6 w-6 text-primary" />
              Why Play This Format?
            </h2>
            <div className="grid sm:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-3 dark:text-foreground text-[#11274F]">For Players</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>No need to stress over predicting the perfect bracket.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>Every game matters—root for your drafted teams and earn points as they advance!</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>See real-time standings—no waiting until the tournament ends.</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3 dark:text-foreground text-[#11274F]">
                  For Pool Commissioners
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>No more manual tracking of scores—our system does the work for you.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>Live updates, standings, and automated scoring eliminate any confusion.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>Players can see their scores anytime, reducing the need for updates.</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-background/60 dark:bg-background/40 backdrop-blur-sm hover:bg-background/80 dark:hover:bg-background/60 transition-colors border-primary/10">
          <CardContent className="p-6 sm:p-8">
            <h2 className="text-2xl font-bold mb-4 dark:text-foreground text-[#11274F] flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-primary" />
              Pricing
            </h2>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4 text-primary" />
                <span>
                  <strong>Creating a pool is free</strong>—you can invite members and complete the draft without
                  payment.
                </span>
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4 text-primary" />
                <span>
                  To unlock scoring, live updates, standings, and bracket view, the commissioner must pay a one-time
                  pool fee.
                </span>
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4 text-primary" />
                <span>The commissioner can pay before or after the draft to activate these features.</span>
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
                  How is this different from a traditional bracket pool?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-primary" />
                      <span>
                        Instead of predicting every game&apos;s winner, you draft teams and earn points as they advance.
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-primary" />
                      <span>Your teams matter throughout the entire tournament, keeping you engaged.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-primary" />
                      <span>Live standings make it more exciting than a static bracket.</span>
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-lg font-semibold dark:text-foreground text-[#11274F]">
                  Can I adjust the scoring system?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes! The Pool Commissioner can customize round points and upset multipliers to create a unique
                  experience.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger className="text-lg font-semibold dark:text-foreground text-[#11274F]">
                  How many players can be in a pool?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Each pool can have 4 to 12 players, depending on how many teams you want per player.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>

      <div className="text-center pb-6">
        <h2 className="text-2xl font-bold mb-4 dark:text-foreground text-[#11274F]">Ready to Play?</h2>
        <p className="text-lg text-muted-foreground mb-8">
          Start a New Pool Today and Experience March Madness Like Never Before!
        </p>
        <Button asChild size="lg" className="text-lg px-8">
          <Link href="/pools/937fb772-f0c7-449f-a639-8d9b44a24f80/details" className="flex items-center gap-2">
            Create Your Pool Now
            <ChevronRight className="h-5 w-5" />
          </Link>
        </Button>
      </div>
    </article>
  )
}


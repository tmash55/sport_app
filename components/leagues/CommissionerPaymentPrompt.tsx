"use client"

import { Trophy, ShieldCheck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import ButtonCheckout from "@/components/ButtonCheckout"
import config from "@/config"

interface CommissionerPaymentPromptProps {
  leagueId: string
  leagueName: string
}

export function CommissionerPaymentPrompt({ leagueId, leagueName }: CommissionerPaymentPromptProps) {
  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <Card className="overflow-hidden">
        <CardHeader className="bg-orange-500 text-primary-foreground p-6">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-5 w-5" />
            <CardTitle className="text-xl font-medium">Unlock the Madness!</CardTitle>
          </div>
          <p className="text-primary-foreground/80 text-sm">One-time ticket to your March Madness adventure</p>
        </CardHeader>
        <CardContent className="p-6 space-y-8">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="space-y-2">
              <h3 className="text-2xl font-medium">Get Ready for the Big Dance!</h3>
              <p className="text-muted-foreground">
                Join the excitement and track your teams through every buzzer-beater
              </p>
            </div>

            <div className="w-full max-w-md bg-secondary p-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-200">
              <ButtonCheckout
                priceId={config.stripe.plans[1].priceId}
                leagueId={leagueId}
                mode="payment"
                metadata={{ leagueId }}
                className="w-full py-4 text-lg font-bold bg-orange-500 hover:bg-orange-600 text-primary-foreground shadow-md"
              >
                Unlock Your Pool Now!
              </ButtonCheckout>
              <p className="mt-3 text-xs text-center text-muted-foreground">Limited spots available. Don&apos;t miss out!</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Your VIP Pass Includes:</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  title: "Courtside Leaderboards",
                  description: "Watch your ranking soar (or dive) with every slam dunk",
                },
                {
                  title: "Bracket Bonanza",
                  description: "Peek at your rivals' picks as the tournament unfolds",
                },
                {
                  title: "Scorekeeping Wizardry",
                  description: "Craft your own upset specials and Cinderella stories",
                },
                {
                  title: "Command Center",
                  description: "Your HQ for all the three-pointers and alley-oops",
                },
              ].map((feature, index) => (
                <div key={index} className="p-4 rounded-lg border bg-card text-card-foreground">
                  <h3 className="font-medium mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center text-xs text-muted-foreground gap-2">
            <ShieldCheck className="h-4 w-4" />
            Slam dunk your payment securely with Stripe
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


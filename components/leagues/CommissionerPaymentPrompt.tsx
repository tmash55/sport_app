"use client"

import { useEffect, useState } from "react"
import { Trophy, ShieldCheck, AlertCircle, CheckCircle2, LockIcon, Info } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import ButtonCheckout from "@/components/ButtonCheckout"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import config from "@/config"
import { getUserPaidLeagues, getPriceIndexForUser } from "@/utils/paymentHelper"
import { useUser } from "@/app/context/UserProvider"

interface CommissionerPaymentPromptProps {
  leagueId: string
  leagueName: string
  contestId: string
}

export function CommissionerPaymentPrompt({ leagueId, leagueName, contestId }: CommissionerPaymentPromptProps) {
  const { user, isLoading: userLoading } = useUser()
  const [priceIndex, setPriceIndex] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user || userLoading) return

    const fetchPrice = async () => {
      if (!contestId) {
        console.error("Contest ID is undefined")
        setError("Invalid contest. Please try again or contact support.")
        setLoading(false)
        return
      }

      try {
        console.log(`Fetching price for user ${user.id} in contest ${contestId}`)
        const paidLeagues = await getUserPaidLeagues(user.id, contestId)
        const newPriceIndex = getPriceIndexForUser(paidLeagues)
        console.log(`New price index: ${newPriceIndex}`)
        setPriceIndex(newPriceIndex)
      } catch (err) {
        console.error("Error fetching price:", err)
        setError("Failed to fetch price. Please try again or contact support.")
      } finally {
        setLoading(false)
      }
    }

    fetchPrice()
  }, [user, contestId, userLoading])

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="container max-w-3xl mx-auto px-4 py-6 sm:py-8">
      <Card className="overflow-hidden shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-primary-foreground p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-5 w-5" />
            <CardTitle className="text-xl font-medium">Unlock the Madness!</CardTitle>
          </div>
          <p className="text-primary-foreground/90 text-sm">One-time ticket to your March Madness adventure</p>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-6 sm:space-y-8">
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 sm:p-4">
            <div className="flex gap-3">
              <div className="mt-1 text-amber-600 dark:text-amber-400 flex-shrink-0">
                <Info className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium text-amber-800 dark:text-amber-300">Commissioner Action Required</h3>
                <p className="text-amber-700 dark:text-amber-400 text-sm mt-1">
                  Your pool's draft is complete! As the commissioner, you need to activate{" "}
                  <span className="font-medium">{leagueName}</span> to unlock features for everyone in your pool.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center text-center space-y-2 px-4">
            <h3 className="text-xl sm:text-2xl font-medium">Get Ready for the Big Dance!</h3>
            <p className="text-muted-foreground max-w-md">
              Join the excitement and track your teams through every buzzer-beater
            </p>
          </div>

          {/* Pricing Card */}
          <div className="w-full max-w-md mx-auto border rounded-xl overflow-hidden shadow-lg transform transition-all duration-300 hover:shadow-xl">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white text-center">

              <h3 className="text-xl font-bold">Tournament Pass</h3>
              <p className="text-sm text-blue-100">Unlock all features for your entire pool</p>
            </div>

            <div className="bg-card p-5 sm:p-6">
              <div className="flex justify-center items-center mb-6">
                <span className="text-3xl sm:text-4xl font-bold text-foreground">
                  ${config.stripe.plans[priceIndex].price}
                </span>
                <span className="text-muted-foreground ml-2 text-sm sm:text-base">one-time</span>
              </div>

              <ul className="space-y-3 mb-6">
                {[
                  "Live standings for all participants",
                  "Team tracking throughout the tournament",
                  "Detailed scoring breakdowns",
                  "Bracket view to track your teams' progress",
                ].map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-foreground/80">{feature}</span>
                  </li>
                ))}
              </ul>

              <ButtonCheckout
                priceId={config.stripe.plans[priceIndex].priceId}
                leagueId={leagueId}
                mode="payment"
                metadata={{ leagueId }}
                className="w-full py-3 sm:py-4 text-base sm:text-lg font-bold bg-orange-500 hover:bg-orange-600 text-primary-foreground shadow-md transition-all duration-200 rounded-lg"
              >
                Activate Pool Now
              </ButtonCheckout>

              <div className="mt-3 flex items-center justify-center gap-1 text-xs text-center text-muted-foreground">
              <ShieldCheck className="h-4 w-4" />
            <span>Secure payment with Stripe</span>
          </div>
            </div>
          </div>

          <Separator className="my-2" />

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Includes:</h4>
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
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
                <div
                  key={index}
                  className="p-3 sm:p-4 rounded-lg border bg-card hover:bg-accent/50 hover:border-accent transition-colors duration-200"
                >
                  <h3 className="font-medium mb-1">{feature.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-center text-xs text-muted-foreground gap-2 pt-2">
          <LockIcon className="h-3 w-3" />
                <span>Limited spots available. Don&apos;t miss out!</span>
          </div>
          
        </CardContent>
      </Card>
    </div>
  )
}


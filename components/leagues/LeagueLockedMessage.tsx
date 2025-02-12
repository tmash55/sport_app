import { Lock, ShoppingBasketIcon as Basketball } from "lucide-react"
import { PiBasketballLight } from "react-icons/pi";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function LeagueLockedMessage() {
  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <Card className="overflow-hidden">
        <CardHeader className="bg-orange-500 text-white p-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="animate-wiggle">
              <Lock className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-bold">Timeout on the Court!</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-4 text-center">
            <p className="text-xl font-semibold">We&apos;re reviewing the play—hang tight!</p>
            <p className="text-lg">The commissioner is still drawing up the perfect play to unlock your pool.</p>
            <div className="animate-bounce">
              <PiBasketballLight className="h-12 w-12 mx-auto text-orange-500" />
            </div>
            <p className="text-muted-foreground">Hang tight! We&apos;ll be back in the game faster than a fast break.</p>
          </div>

          <div className="flex justify-center">
            <Button asChild className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white">
              <Link href="/dashboard/my-pools" className="flex items-center justify-center">
                <span>Head Back to the Locker Room</span>
                <PiBasketballLight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


"use client"

import React, { useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import apiClient from "@/libs/api"
// import { createClient } from "@/libs/supabase/client" // Removed import
// import { useToast } from "@/hooks/use-toast" // Removed import

interface ButtonCheckoutProps {
  priceId: string
  leagueId: string
  mode?: "payment" | "subscription"
  metadata?: Record<string, string>
  className?: string
  children?: ReactNode
}

const ButtonCheckout: React.FC<ButtonCheckoutProps> = ({
  priceId,
  leagueId,
  mode = "payment",
  metadata = {},
  className,
  children,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handlePayment = async () => {
    setIsLoading(true)

    try {
      const { url }: { url: string } = await apiClient.post("/stripe/create-checkout", {
        priceId,
        successUrl: `${window.location.origin}/dashboard/leagues/${leagueId}?payment=success`,
        cancelUrl: `${window.location.origin}/dashboard/leagues/${leagueId}?payment=cancelled`,
        mode,
        metadata: { ...metadata, leagueId },
      })

      router.push(url)
    } catch (e) {
      console.error(e)
      // TODO: Add error handling, e.g., show an error toast
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handlePayment} disabled={isLoading} className={cn("min-w-[150px]", className)}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        children || "Checkout"
      )}
    </Button>
  )
}

export default ButtonCheckout


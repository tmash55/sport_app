'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

interface JoinLinkGeneratorProps {
  leagueId: string
}

export function JoinLinkGenerator({ leagueId }: JoinLinkGeneratorProps) {
  const [isCopied, setIsCopied] = useState(false)
  const { toast } = useToast()

  const joinLink = `${window.location.origin}/invite/${leagueId}`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(joinLink)
      setIsCopied(true)
      toast({
        title: "Link Copied",
        description: "The invite link has been copied to your clipboard.",
      })
      setTimeout(() => setIsCopied(false), 3000)
    } catch (err) {
      console.error('Failed to copy: ', err)
      toast({
        title: "Error",
        description: "Failed to copy the link. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <Input
        type="text"
        value={joinLink}
        readOnly
        className="flex-grow"
      />
      <Button onClick={copyToClipboard} disabled={isCopied}>
        {isCopied ? "Copied!" : "Copy Link"}
      </Button>
    </div>
  )
}


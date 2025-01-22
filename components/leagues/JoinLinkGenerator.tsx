"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Check, Copy } from "lucide-react"

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
      console.error("Failed to copy: ", err)
      toast({
        title: "Error",
        description: "Failed to copy the link. Please try again.",
        variant: "destructive",
      })
    }
  }

  const selectText = (event: React.MouseEvent<HTMLInputElement>) => {
    event.currentTarget.select()
  }

  return (
    <div className="space-y-2">
      <div className="hidden sm:flex sm:flex-row gap-2">
        <Input
          type="text"
          value={joinLink}
          onClick={selectText}
          className="font-mono text-xs bg-background cursor-text"
          readOnly
        />
        <Button variant="default" size="icon" onClick={copyToClipboard} disabled={isCopied} className="shrink-0">
          {isCopied ? <Check className="h-4 w-4 text-white" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      <div className="sm:hidden">
        <Button variant="default" onClick={copyToClipboard} disabled={isCopied} className="w-full">
          {isCopied ? "Copied!" : "Copy Invite Link"}
        </Button>
      </div>
    </div>
  )
}


"use client"

import { useState } from "react"
import { Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CommishHQDialog } from "@/components/NFL-Draft/CommishHQDialog"
import { useNflDraft } from "@/app/context/NflDraftContext"

export function CommishHQButton() {
  const [isCommishHQOpen, setIsCommishHQOpen] = useState(false)

  // Use the useNflDraft hook to access the context
  const { isCommissioner } = useNflDraft()

  // If user is not a commissioner, don't render anything
  if (!isCommissioner) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-10">
      <CommishHQDialog isOpen={isCommishHQOpen} onOpenChange={setIsCommishHQOpen} initialSection="main">
        <Button
          variant="default"
          className="h-10 w-10 sm:h-12 sm:w-12 rounded-full shadow-lg hover:shadow-xl transition-all"
          onClick={() => setIsCommishHQOpen(true)}
        >
          <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </CommishHQDialog>
    </div>
  )
}


import { Bracket } from "@/components/bracket/Bracket"
import { BracketHeader } from "@/components/bracket/BracketHeader"

export default function BracketPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <div className="flex-1 overflow-hidden">
        <div className="h-full">
          <BracketHeader />
          <div className="scrollbar-none h-[calc(100vh-8rem)] overflow-auto px-4 py-2">
            <Bracket />
          </div>
        </div>
      </div>
    </div>
  )
}


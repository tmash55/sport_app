import type { ReactNode } from "react"

interface BracketLayoutProps {
  children: ReactNode
}

export default function BracketLayout({ children }: BracketLayoutProps) {
  return (
    // This div replaces the container from the parent layout
    // We're removing max-w-7xl and using minimal padding
    <div className="w-full px-0 sm:px-2 py-2 space-y-4">
      {children}
    </div>
  )
}

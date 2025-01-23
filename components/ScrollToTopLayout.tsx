"use client"

import React, { useEffect } from "react"
import { usePathname } from "next/navigation"

export function ScrollToTopLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return <>{children}</>
}


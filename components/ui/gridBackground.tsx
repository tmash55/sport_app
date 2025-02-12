import type React from "react"
import { cn } from "@/lib/utils"

export const GridBackground = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        "absolute inset-0 -z-10 h-full w-full bg-background [background-image:radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]",
        className,
      )}
      {...props}
    />
  )
}


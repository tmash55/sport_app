"use client"

import Image from "next/image"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

interface ThemeSwitchingLogoProps {
  width?: number
  height?: number
  className?: string
}

export function ThemeSwitchingLogo({ width = 36, height = 30, className = "rounded-lg" }: ThemeSwitchingLogoProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [imgSrc, setImgSrc] = useState("/icon.png")

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      // Always use icon.png, but we'll invert it for light mode
      setImgSrc("/icon.png")
    }
  }, [mounted]) // Removed resolvedTheme from dependencies

  if (!mounted) {
    return null
  }

  return (
    <div className="flex items-center justify-center">
      <Image
        src={imgSrc || "/placeholder.svg"}
        alt="Logo"
        width={width}
        height={height}
        className={`${className} ${resolvedTheme === "light" ? "invert" : ""}`}
        onError={() => {
          console.error("Failed to load image:", imgSrc)
          setImgSrc("/placeholder.svg")
        }}
      />
    </div>
  )
}


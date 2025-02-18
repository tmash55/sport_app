"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import styled from "@emotion/styled"
import { keyframes } from "@emotion/react"

const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
  }
`

const StyledButton = styled(Button)`
  background: linear-gradient(45deg, #3b82f6, #60a5fa);
  border: none;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    animation: ${pulse} 1.5s infinite;
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`

export function DashboardHeader() {
  return (
    <div className="py-8 md:py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">My Pools</h1>
        <StyledButton asChild className="md:hidden">
          <Link href="/contests/start">
            <PlusCircle className="mr-2 h-4 w-4" />
            New
          </Link>
        </StyledButton>
      </div>
      <div className="mt-1 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Manage your pools and contests
        </p>
        <StyledButton asChild className="hidden md:inline-flex">
          <Link href="/pools/start">
            <PlusCircle className="mr-2 h-4 w-4" />
            Start a pool
          </Link>
        </StyledButton>
      </div>
    </div>
  )
}


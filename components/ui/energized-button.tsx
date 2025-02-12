"use client"

import * as React from "react"
import { Button, type ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { keyframes } from "@emotion/react"
import styled from "@emotion/styled"

const pulseAnimation = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(255, 140, 0, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(255, 140, 0, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 140, 0, 0);
  }
`

const StyledButton = styled(Button)`
  background-color: #ff8c00;
  color: white;
  font-weight: bold;
  transition: all 0.3s ease;
  animation: ${pulseAnimation} 2s infinite;

  &:hover {
    background-color: #ff7300;
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(255, 140, 0, 0.2);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(255, 140, 0, 0.2);
  }
`

export interface EnergizedButtonProps extends ButtonProps {}

export const EnergizedButton = React.forwardRef<HTMLButtonElement, EnergizedButtonProps>(
  ({ className, ...props }, ref) => {
    return <StyledButton className={cn("energized-button", className)} ref={ref} {...props} />
  },
)

EnergizedButton.displayName = "EnergizedButton"


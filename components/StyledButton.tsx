"use client"

import type React from "react"
import styled from "@emotion/styled"
import { keyframes } from "@emotion/react"
import { Button, type ButtonProps } from "./ui/button"

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

export interface PulseButtonProps extends ButtonProps {
  children: React.ReactNode
}

export function PulseButton({ children, ...props }: PulseButtonProps) {
  return <StyledButton {...props}>{children}</StyledButton>
}


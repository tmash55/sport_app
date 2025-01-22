'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface InfoButtonProps {
  href: string
}

export function InfoButton({ href }: InfoButtonProps) {
  return (
    <Button
      asChild
      variant="outline"
      className="w-full group-hover:bg-primary/5 transition-colors"
      onClick={(e) => e.stopPropagation()}
    >
      <Link href={href}>More Info</Link>
    </Button>
  )
}


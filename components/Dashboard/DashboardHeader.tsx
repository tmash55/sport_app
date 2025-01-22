import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'

export function DashboardHeader() {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 py-8 md:py-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">My Pools</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your leagues and contests
        </p>
      </div>
      <Button asChild>
        <Link href="/contests/start" className="inline-flex items-center">
          <PlusCircle className="mr-2 h-4 w-4" />
          Start a pool
        </Link>
      </Button>
    </div>
  )
}


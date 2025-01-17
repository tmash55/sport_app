import Link from 'next/link'
import { Trophy, Menu } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from '@/components/ui/button'
import { AuthButtons } from '@/components/AuthButtons'
import { ThemeToggle } from '@/components/ThemeToggle'

const menuItems = [
  { name: 'Start a New Contest', href: '/contests/start' },
  { name: 'Join a Contest', href: '/join-contest' },
  { name: 'Blog', href: '/blog' },
  { name: 'Support', href: '/support' },
]

export function Navigation() {
  return (
    <nav className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Trophy className="h-6 w-6" />
          <span className="text-lg font-bold">DraftPlay</span>
        </Link>
        
        <div className="hidden md:flex md:items-center md:gap-6">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {item.name}
            </Link>
          ))}
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex sm:items-center sm:gap-4">
            <ThemeToggle />
            <AuthButtons />
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4">
                {menuItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="mt-4">
                  <ThemeToggle />
                </div>
                <div className="mt-4">
                  <AuthButtons />
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}


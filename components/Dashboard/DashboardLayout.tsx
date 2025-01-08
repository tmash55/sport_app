"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Trophy, Users, PlusCircle, UserCircle, LogOut } from 'lucide-react'
import { createClient } from "@/libs/supabase/client";
import { useRouter } from 'next/navigation'

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'My Leagues', href: '/dashboard/leagues', icon: Trophy },
  { name: 'Join League', href: '/dashboard/join', icon: Users },
  { name: 'Create League', href: '/dashboard/create', icon: PlusCircle },
  { name: 'Tournament Scores', href: '/dashboard/scores', icon: Trophy },
  { name: 'Account', href: '/dashboard/account', icon: UserCircle },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  const router = useRouter()
  const supabase = createClient();
  const handleSignOut = async () => {
    try {
        await supabase.auth.signOut();
        router.push("/");
      } catch (error) {
        console.error("Error signing out:", error);
      }
    };

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 bg-card text-card-foreground shadow-md">
        <nav className="mt-5 px-2">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link href={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start",
                      pathname === item.href
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <item.icon className="mr-3 h-6 w-6" />
                    {item.name}
                  </Button>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="absolute bottom-0 w-full p-4">
          <Button
            variant="outline"
            className="w-full justify-start text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            onClick={handleSignOut}
          >
            <LogOut className="mr-3 h-6 w-6" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-8 ">
        {children}
      </main>
    </div>
  )
}



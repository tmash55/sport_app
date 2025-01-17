"use client"
import * as React from "react"
import { Trophy, LayoutDashboard, Users, PlusCircle, Settings, LogOut } from 'lucide-react'
import Link from "next/link"
import { usePathname } from "next/navigation"


import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarFooter
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { NavUser } from "@/components/Dashboard/nav-user"
import { ThemeToggle } from "@/components/ThemeToggle"
import { UserLeagues } from "@/components/Dashboard/user-leagues"

// This is sample data. In a real application, you'd fetch this from your backend.
const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Join a Pool",
      url: "/dashboard/join",
      icon: Users,
    },
    {
      title: "Create a Pool",
      url: "/contests/start",
      icon: PlusCircle,
    },
    {
      title: "Tournament",
      url: "#",
      icon: Trophy,
      items: [
        {
          title: "Bracket",
          url: "/dashboard/bracket",
        },
        {
          title: "Scores",
          url: "/dashboard/scores",
        },
        {
          title: "Leaderboard",
          url: "/dashboard/leaderboard",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
            <Link href="/dashboard" className="flex items-center gap-3">
        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <Trophy className="size-5" />
        </div>
        <span className="font-semibold text-lg">DraftPlay</span>
      </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {data.navMain.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={pathname === item.url}>
                  <Link href={item.url} className="font-medium">
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.title}
                  </Link>
                </SidebarMenuButton>
                {item.items?.length ? (
                  <SidebarMenuSub>
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={pathname === subItem.url}
                        >
                          <Link href={subItem.url}>{subItem.title}</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                ) : null}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/dashboard/leagues"}>
                <Link href="/dashboard/leagues" className="font-medium">
                  <Trophy className="mr-2 h-4 w-4" />
                  My Leagues
                </Link>
              </SidebarMenuButton>
              <SidebarMenuSub>
                <UserLeagues />
              </SidebarMenuSub>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <ThemeToggle />
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}


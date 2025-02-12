"use client"

import type * as React from "react"
import {LayoutDashboard, Users, PlusCircle,} from "lucide-react"
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
  SidebarRail,
  SidebarFooter,
  SidebarGroupContent,
  SidebarGroupLabel
} from "@/components/ui/sidebar"
import { NavUser } from "@/components/Dashboard/nav-user"
import { UserLeagues } from "@/components/Dashboard/user-leagues"
import { useLeagues } from "@/app/context/LeaguesContext"
import { Separator } from "../ui/separator"
import { ThemeSwitchingLogo } from "../ui/ThemeSwitchingLogo"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard/my-pools",
      icon: LayoutDashboard,
    },
  
    {
      title: "Create a Pool",
      url: "/pools/start",
      icon: PlusCircle,
    },  
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { leagues, userId, error } = useLeagues()

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
            <Link href="/" className="group relative flex items-center gap-3">
                <div className="flex items-center justify-center">
                <ThemeSwitchingLogo />
                </div>
                <span className="text-2xl transition-colors font-bold">dryft</span>
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
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.url}
                  className="hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <Link href={item.url} className="font-medium">
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.title}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            <Separator className="mt-2" />
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarGroupLabel className="px-3 pb-2 text-sm font-semibold uppercase text-foreground">
              My Pools
            </SidebarGroupLabel>
            <SidebarMenuSub>
              <UserLeagues leagues={leagues} isLoading={!leagues && !error} error={error} />
            </SidebarMenuSub>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}


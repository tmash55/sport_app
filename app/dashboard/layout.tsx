import React, { type ReactNode } from "react";
import { AppSidebar } from "@/components/Dashboard/app-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { DynamicBreadcrumb } from "@/components/Dashboard/dynamic-breadcrumb";
import { Separator } from "@/components/ui/separator";
import { LeaguesProvider } from "../context/LeaguesContext";
import { DashboardFooter } from "@/components/DashboardFooter";
import { UserProvider } from "../context/UserProvider";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <UserProvider>
      <LeaguesProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset className="flex flex-col">
            <header className="sticky top-0 z-10 flex h-20 shrink-0 items-center justify-between gap-2 border-b px-4 bg-sidebar text-foreground">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <div className="min-h-[22px]">
                  <DynamicBreadcrumb />
                </div>
              </div>
            </header>
            <main className="flex-1 overflow-y-auto">
              <div className="flex flex-col gap-4 p-4">{children}</div>
            </main>
            <DashboardFooter />
          </SidebarInset>
        </SidebarProvider>
      </LeaguesProvider>
    </UserProvider>
  );
}

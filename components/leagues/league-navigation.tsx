"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Settings, Users2, Trophy, ListTodo, BarChart3 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLeague } from "@/app/context/LeagueContext"; // Use context hook directly

const navigationItems = [
    {
      label: "Draft",
      icon: ListTodo,
      href: (id: string) => `/dashboard/leagues/${id}/draft`,
      value: "draft",
    },
    {
        label: "League",
        icon: BarChart3,
        href: (id: string) => `/dashboard/leagues/${id}`, // Updated to root of league
        value: "league",
      },
    {
      label: "Team",
      icon: Users2,
      href: (id: string) => `/dashboard/leagues/${id}/team`,
      value: "team",
    },
    {
      label: "Standings",
      icon: Trophy,
      href: (id: string) => `/dashboard/leagues/${id}/standings`,
      value: "standings",
    },
    
  ];
  

export function LeagueNavigation() {
  const pathname = usePathname();
  const { leagueData, isLoading, error } = useLeague(); // Use data from context

  if (isLoading) {
    return (
      <div className="text-center p-4">
        <p>Loading league data...</p>
      </div>
    );
  }

  if (error) {
    console.error("Error fetching league data:", error);
    return (
      <div className="text-center p-4">
        <p>Error loading league data. Please try again later.</p>
      </div>
    );
  }

  const leagueId = leagueData.id; // Extract leagueId from leagueData
  const draftStatus = leagueData.drafts?.status || "pre_draft";

  // Filter navigation items based on the draft status
  const filteredNavigationItems = draftStatus === "completed"
    ? navigationItems.filter((item) => item.value !== "draft") // Hide the "Draft" tab
    : navigationItems;

  // Helper function to determine active tab value
  const getActiveTabValue = () => {
    if (pathname.includes("/draft")) return "draft";
    if (pathname.includes("/team")) return "team";
    if (pathname.includes("/standings")) return "standings";
    if (pathname === `/dashboard/leagues/${leagueId}`) return "league"; // Updated for root path
    return "league"; // Default to league overview
  };
  

  return (
    <>
      {/* Mobile Navigation - Tabs */}
      <div className="md:hidden">
        <Tabs defaultValue={getActiveTabValue()} className="w-full">
          <TabsList className="w-full">
            {filteredNavigationItems.map((item) => (
              <TabsTrigger key={item.value} value={item.value} asChild className="flex-1">
                <Link href={item.href(leagueId)}>
                  <item.icon className="h-4 w-4 md:mr-2" />
                  <span className="sr-only md:not-sr-only">{item.label}</span>
                </Link>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Desktop Navigation - Cards */}
      <div className="hidden md:grid grid-cols-4 gap-4">
        {filteredNavigationItems.map((item) => {
          const isActive = pathname === item.href(leagueId);
          return (
            <Link key={item.label} href={item.href(leagueId)} className="block">
              <div
                className={`
                flex items-center gap-3 p-4 rounded-lg border transition-all
                hover:bg-accent hover:text-accent-foreground
                ${isActive ? "bg-primary/10 border-primary/20 shadow-sm" : "bg-card hover:border-accent"}
              `}
              >
                <item.icon className={`h-5 w-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                <span className="font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}

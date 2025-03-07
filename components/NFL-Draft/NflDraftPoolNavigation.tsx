"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, PenLine, Trophy, BarChart } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { cn } from "@/lib/utils";
import { useNflDraft } from "@/app/context/NflDraftContext";

const navigationItems = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    href: (id: string) => `/dashboard/pools/nfl-draft/${id}`,
    value: "overview",
  },
  {
    label: "My Entries",
    icon: PenLine,
    href: (id: string) => `/dashboard/pools/nfl-draft/${id}/my-entries`,
    value: "entries",
  },
  {
    label: "Standings",
    icon: Trophy,
    href: (id: string) => `/dashboard/pools/nfl-draft/${id}/standings`,
    value: "standings",
  },
  {
    label: "Reports",
    icon: BarChart,
    href: (id: string) => `/dashboard/pools/nfl-draft/${id}/reports`,
    value: "reports",
  },
];

export function NflDraftPoolNavigation() {
  const pathname = usePathname();
  const { league } = useNflDraft();

  if (!league) {
    return null;
  }

  const poolId = league.id;

  const getActiveTabValue = () => {
    if (pathname.includes("/my-entries")) return "entries";
    if (pathname.includes("/standings")) return "standings";
    if (pathname.includes("/reports")) return "reports";
    return "overview";
  };

  return (
    <div className="bg-background shadow-md rounded-lg p-2 md:p-4 mb-4 md:mb-6">
      {/* Mobile Navigation - Tabs */}
      <div className="md:hidden">
        <Tabs defaultValue={getActiveTabValue()} className="w-full">
          <TabsList className="w-full grid grid-cols-2 h-auto gap-2 bg-muted/50 p-2 rounded-lg">
            {navigationItems.map((item) => (
              <TabsTrigger
                key={item.value}
                value={item.value}
                asChild
                className="flex-1 h-14 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all duration-200 ease-in-out hover:bg-accent hover:text-accent-foreground group"
              >
                <Link
                  href={item.href(poolId)}
                  className="flex flex-col items-center justify-center py-1 px-2 h-full"
                >
                  <item.icon className="h-4 w-4 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-medium line-clamp-1 group-hover:font-bold">
                    {item.label}
                  </span>
                </Link>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Desktop Navigation - Cards */}
      <div className="hidden md:grid grid-cols-4 gap-4">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href(poolId);
          return (
            <Link
              key={item.label}
              href={item.href(poolId)}
              className="block group"
            >
              <div
                className={cn(
                  "flex items-center gap-3 p-4 rounded-lg border transition-all duration-200 ease-in-out",
                  {
                    "bg-primary text-primary-foreground shadow-md": isActive,
                    "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:shadow-md group-hover:scale-105 group-hover:-translate-y-1":
                      !isActive,
                  }
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 transition-transform group-hover:scale-110",
                    {
                      "text-primary-foreground": isActive,
                    }
                  )}
                />
                <span
                  className={cn(
                    "font-medium text-sm transition-all group-hover:font-bold",
                    {
                      "text-primary-foreground": isActive,
                    }
                  )}
                >
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

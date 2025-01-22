"use client";

import { Suspense } from "react";
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";
import { DashboardTabs } from "@/components/Dashboard/DashboardTabs";
import { LeagueGrid } from "@/components/Dashboard/LeagueGrid";
import { Skeleton } from "@/components/ui/skeleton";
import { useLeagues } from "@/app/context/LeaguesContext";


export default function MyPoolsPage() {
  const { leagues, userId } = useLeagues();

  if (!leagues || !userId) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  return (
    <div className="container max-w-7xl mx-auto p-4">
      <DashboardHeader />
      <Suspense fallback={<Skeleton className="h-[100px] w-full" />}>
        <DashboardTabs leagues={leagues} />
      </Suspense>
      <Suspense
        fallback={
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-[200px] rounded-lg" />
            ))}
          </div>
        }
      >
        <LeagueGrid leagues={leagues} userId={userId} />
      </Suspense>
    </div>
  );
}

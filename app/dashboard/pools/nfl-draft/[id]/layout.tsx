import type { ReactNode } from "react";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/libs/supabase/server";
import { ScrollToTopLayout } from "@/components/ScrollToTopLayout";
import { NflDraftProvider } from "@/app/context/NflDraftContext";
import { NflDraftPoolNavigation } from "@/components/NFL-Draft/NflDraftPoolNavigation";
import { CommishHQButton } from "@/components/NFL-Draft/CommishHQButton";

interface LayoutProps {
  children: ReactNode;
  params: { id: string };
}

export default async function NFLDraftLayout({ children, params }: LayoutProps) {
  const supabase = createClient();



  // ✅ Server-side authentication
  const { data: userResponse, error: userError } = await supabase.auth.getUser();
  if (userError || !userResponse.user) {
    console.error("❌ User authentication error:", userError);
    redirect("/sign-in");
  }



  const { data: leagueData, error: leagueError } = (await supabase
    .from("leagues")
    .select("*, league_members(id, user_id, role), roster_entries(*)")
    .eq("id", params.id)
    .single()) as unknown as { data: any | null; error: any };

  if (leagueError || !leagueData) {
    notFound();
  }



  // ✅ Check user access
  const isLeagueMember = leagueData.league_members.some(
    (member: { user_id: string }) => member.user_id === userResponse.user.id
  );
  const isCommissioner = leagueData.commissioner_id === userResponse.user.id;



  if (!isLeagueMember && !isCommissioner) {

    redirect("/dashboard");
  }

  // ✅ Pass initial league data to NflDraftProvider
  return (
    <ScrollToTopLayout>
      <NflDraftProvider leagueId={params.id} initialLeagueData={leagueData}>
        <div className="flex flex-col min-h-full">
          <div className="flex-grow overflow-y-auto">
            <div className="container max-w-7xl mx-auto px-4 sm:px-4 py-2 sm:py-6 space-y-4 sm:space-y-6 border-0 sm:border sm:border-r-1 sm:rounded-2xl">
              <NflDraftPoolNavigation />
              <main>{children}</main>
            </div>
          </div>
        </div>
              <CommishHQButton />
      </NflDraftProvider>
    </ScrollToTopLayout>
  );
}


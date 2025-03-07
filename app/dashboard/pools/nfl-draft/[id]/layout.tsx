import type { ReactNode } from "react";
import { Settings } from "lucide-react";

import { ScrollToTopLayout } from "@/components/ScrollToTopLayout";
import { Button } from "@/components/ui/button";
import { NflDraftPoolNavigation } from "@/components/NFL-Draft/NflDraftPoolNavigation";
import { NflDraftProvider } from "@/app/context/NflDraftContext";
import { CommishHQDialog } from "@/components/NFL-Draft/CommishHQDialog";
import { CommishHQButton } from "@/components/NFL-Draft/CommishHQButton";

interface LayoutProps {
  children: ReactNode;
  params: { id: string };
}

export default function NFLDraftLayout({ children, params }: LayoutProps) {
  return (
    <ScrollToTopLayout>
      <NflDraftProvider leagueId={params.id}>
      <div>
      <div className="flex flex-col min-h-full">
          <div className="flex-grow overflow-y-auto">
          <div className="container max-w-7xl mx-auto px-4 sm:px-4 py-2 sm:py-6 space-y-4 sm:space-y-6 border-0 sm:border sm:border-r-1 sm:rounded-2xl">
              <NflDraftPoolNavigation />
              <main>{children}</main>
            </div>
          </div>

        </div>
      

      <CommishHQButton />
    </div>
      </NflDraftProvider>
    </ScrollToTopLayout>
  );
}


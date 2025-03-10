"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createClient } from "@/libs/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface JoinConfirmationProps {
  leagueId: string;
  leagueName: string;
  contestName: string;
  contestId: string;
}

export function JoinConfirmation({
  leagueId,
  leagueName,
  contestName,
  contestId,
}: JoinConfirmationProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [membershipStatus, setMembershipStatus] = useState<
    "checking" | "member" | "joined" | "error" | "full"
  >("checking");
  const [userDisplayName, setUserDisplayName] = useState<string>("");
  const router = useRouter();
  const formattedContestName = contestName.replace(/\s+/g, "-").toLowerCase();
  const supabase = createClient();
  const { toast } = useToast();
  const MARCH_MADNESS_CONTEST_IDS = [
    "937fb772-f0c7-449f-a639-8d9b44a24f80", // March Madness Contest ID
  ];
  
  const NFL_DRAFT_CONTEST_IDS = [
    "d282f9e8-4b9c-4218-a270-215c635a7e29", // NFL Draft Contest ID
  ];
  

  const fetchUserDisplayName = useCallback(
    async (userId: string) => {
      const { data, error } = await supabase
        .from("users")
        .select("display_name")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user display name:", error);
        return null;
      }

      return data?.display_name;
    },
    [supabase]
  );

  useEffect(() => {
    const checkMembershipAndJoin = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          console.error("No authenticated user found");
          setMembershipStatus("error");
          return;
        }
  
        const displayName = await fetchUserDisplayName(user.id);
        const finalDisplayName =
          displayName || user.email?.split("@")[0] || "Unknown";
        setUserDisplayName(finalDisplayName);
  
        console.log("Attempting to join contest:", contestId, "for user:", user.id);
  
        let rpcFunction;
        let rpcParams;
  
        if (MARCH_MADNESS_CONTEST_IDS.includes(contestId)) {
          // Use March Madness join function
          rpcFunction = "check_and_join_league";
          rpcParams = {
            p_league_id: leagueId,
            p_user_id: user.id,
            p_display_name: finalDisplayName,
          };
        } else if (NFL_DRAFT_CONTEST_IDS.includes(contestId)) {
          // Use NFL Draft join function
          rpcFunction = "check_and_join_nfl_draft";
          rpcParams = {
            p_draft_id: leagueId,
            p_user_id: user.id,
            p_display_name: finalDisplayName,
          };
        } else {
          // Default to a general pool join function for other contests
          rpcFunction = "check_and_join_pool";
          rpcParams = {
            p_pool_id: leagueId,
            p_user_id: user.id,
            p_display_name: finalDisplayName,
          };
        }
  
        const { data, error } = await supabase.rpc(rpcFunction, rpcParams);
  
        console.log(`${rpcFunction} result:`, data, error);
  
        if (error) {
          console.error(`Error in ${rpcFunction}:`, error);
          setMembershipStatus("error");
          return;
        }
  
        if (data.status === "already_member") {
          console.log("User is already a member");
          setMembershipStatus("member");
        } else if (data.status === "joined") {
          console.log("User successfully joined the contest");
          setMembershipStatus("joined");
          toast({
            title: "Joined Successfully",
            description: `You have successfully joined ${leagueName} as ${data.team_name}.`,
          });
        } else if (data.status === "full") {
          console.log("Contest is full");
          setMembershipStatus("full");
        } else {
          console.error("Unexpected status:", data.status);
          setMembershipStatus("error");
        }
      } catch (error) {
        console.error("Unexpected error:", error);
        setMembershipStatus("error");
      }
    };
  
    checkMembershipAndJoin();
  }, [leagueId, contestId, leagueName, supabase, toast, fetchUserDisplayName]);
  

  useEffect(() => {
    if (membershipStatus === "member" || membershipStatus === "joined") {
      const timer = setTimeout(() => {
        router.push(`/dashboard/pools/${formattedContestName}/${leagueId}`);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [membershipStatus, leagueId, router]);

  const handleClose = () => {
    setIsOpen(false);
    router.push("/dashboard");
  };

  const renderContent = () => {
    switch (membershipStatus) {
      case "checking":
        return (
          <>
            <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-4" />
            <DialogDescription>
              Checking your membership status...
            </DialogDescription>
          </>
        );
      case "member":
        return (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <DialogDescription>
              You are already a member of this league. Redirecting you to the
              league page...
            </DialogDescription>
          </>
        );
      case "joined":
        return (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <DialogDescription>
              You have successfully joined the league. You will be redirected to
              the league page in a few seconds.
            </DialogDescription>
          </>
        );
      case "full":
        return (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <DialogDescription>
              Sorry, this league is already full. Please try joining another
              league or create your own.
            </DialogDescription>
          </>
        );
      case "error":
        return (
          <>
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <DialogDescription>
              There was an error processing your request. Please try again later
              or contact support if the problem persists.
            </DialogDescription>
          </>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-center">
            {membershipStatus === "member" ? "Welcome back to" : "Welcome to"}{" "}
            {leagueName}!
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-6">
          {renderContent()}
        </div>
        <DialogFooter>
          <Button onClick={handleClose} className="w-full">
            {membershipStatus === "full"
              ? "Go to Dashboard"
              : "Go to League Page"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

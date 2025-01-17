import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/libs/supabase/client";
import { updateLeagueMaxTeams } from "@/app/actions/league-actions";
import { useRouter } from "next/navigation";

interface LeagueGeneralSettingsProps {
  leagueId: string;
  isCommissioner: boolean;
  league: any;
  leagueSettings: any;
  draft: any;
  onUpdate: () => void;
}

export function LeagueGeneralSettings({
  leagueId,
  isCommissioner,
  league,
  leagueSettings,
  draft,
  onUpdate,
}: LeagueGeneralSettingsProps) {
  const [leagueName, setLeagueName] = useState(league?.name || "");
  const [maxTeams, setMaxTeams] = useState(leagueSettings?.max_teams || 0);
  const [isLoading, setIsLoading] = useState(false);
  const [isDraftStarted, setIsDraftStarted] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();
  const router = useRouter(); // Initialize router


  useEffect(() => {
    setLeagueName(league?.name || "");
    setMaxTeams(leagueSettings?.max_teams || 0);
    setIsDraftStarted(draft?.status !== "pre_draft");
  }, [league, leagueSettings, draft]);

  const handleSave = async () => {
    if (!isCommissioner) return;
    setIsLoading(true);
  
    try {
      // Update league name directly
      const { error: leagueError } = await supabase
        .from("leagues")
        .update({ name: leagueName })
        .eq("id", leagueId);
  
      if (leagueError) {
        throw leagueError;
      }
  
      // Update max_teams in both league_members and league_settings
      if (draft?.status === "pre_draft") {
        const result = await updateLeagueMaxTeams(leagueId, maxTeams);
  
        if (result.error) {
          if (result.error.includes("Cannot reduce league size")) {
            // Specific error when trying to reduce league size while it's full
            toast({
              title: "Error",
              description:
                "The league is full. Please remove users before reducing the league size.",
              variant: "destructive",
            });
          } else {
            throw new Error(result.error);
          }
          return; // Exit early if specific error occurs
        }
      }
  
      onUpdate();
      router.refresh();

      toast({
        title: "Success",
        description: "League settings updated successfully.",
      });
    } catch (error) {
      console.error("Error updating league settings:", error);
      toast({
        title: "Error",
        description: "Failed to update league settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="leagueName">League Name</Label>
        <Input
          id="leagueName"
          value={leagueName}
          onChange={(e) => setLeagueName(e.target.value)}
          disabled={!isCommissioner || isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="maxTeams">Max Teams</Label>
        <Input
          id="maxTeams"
          type="number"
          min={4}
          max={14}
          value={maxTeams}
          onChange={(e) => setMaxTeams(parseInt(e.target.value))}
          disabled={!isCommissioner || isLoading || isDraftStarted}
        />
        {isDraftStarted && (
          <p className="text-sm text-muted-foreground">
            Max teams cannot be changed after the draft has started.
          </p>
        )}
      </div>
      <Button onClick={handleSave} disabled={!isCommissioner || isLoading}>
        {isLoading ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
}

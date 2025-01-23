import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Trophy } from "lucide-react";
import { LeagueTeam } from "@/types/draft";
import { createClient } from "@/libs/supabase/client";

interface AvailableTeamsProps {
  leagueId: string;
  teams: LeagueTeam[];
  draftedTeamIds: Set<string> | string[]
  onDraftPick: (teamId: string) => void;
  isUsersTurn: boolean;
  isDraftInProgress: boolean;
}

interface LocalTeam extends LeagueTeam {
  is_drafted: boolean;
}

export function AvailableTeams({
  leagueId,
  teams,
  draftedTeamIds: initialDraftedTeamIds,
  onDraftPick,
  isUsersTurn,
  isDraftInProgress,
}: AvailableTeamsProps) {
  const [localTeams, setLocalTeams] = useState<LocalTeam[]>([]);
  const [draftedTeamIds, setDraftedTeamIds] = useState<Set<string>>(new Set(initialDraftedTeamIds))
  const [showDraftedTeams, setShowDraftedTeams] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const supabase = createClient();

  useEffect(() => {
    // Initialize localTeams with drafted status
    setLocalTeams(
      teams.map((team) => ({
        ...team,
        is_drafted: draftedTeamIds.has(team.id),
      }))
    );
  }, [teams, draftedTeamIds]);

  useEffect(() => {
    // Real-time subscription for draft picks
    const subscription = supabase
      .channel(`draft_picks_${leagueId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "draft_picks",
          filter: `league_id=eq.${leagueId}`,
        },
        (payload) => {
          const newDraftedTeamId = payload.new.team_id;

          setDraftedTeamIds((prev) => {
            const updatedSet = new Set(prev);
            updatedSet.add(newDraftedTeamId);
            return updatedSet;
          });

          setLocalTeams((prevTeams) =>
            prevTeams.map((team) =>
              team.id === newDraftedTeamId ? { ...team, is_drafted: true } : team
            )
          );
        }
      )
      .subscribe();

    // Cleanup subscription on component unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [leagueId, supabase]);

  const filteredTeams = useMemo(() => {
    return localTeams
      .filter(
        (team) =>
          (showDraftedTeams || !team.is_drafted) &&
          (team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            team.global_teams.seed.toString().includes(searchQuery))
      )
      .sort((a, b) => a.global_teams.seed - b.global_teams.seed);
  }, [localTeams, searchQuery, showDraftedTeams]);

  const getTeamLogoUrl = (filename: string | null | undefined) => {
    return filename ? `/images/team-logos/${filename}` : null;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Input
          type="text"
          placeholder="Search teams by name or seed"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full mr-4"
        />
       
      </div>
      <ScrollArea className="h-[400px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Draft</TableHead>
              <TableHead>Seed</TableHead>
              <TableHead>Team Name</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTeams.map((team) => (
              <TableRow key={team.id}>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDraftPick(team.id)}
                    disabled={!isUsersTurn || !isDraftInProgress || team.is_drafted}
                  >
                    Draft
                  </Button>
                </TableCell>
                <TableCell>{team.global_teams.seed}</TableCell>
                <TableCell className="flex items-center gap-2">
                  {team.global_teams.logo_filename ? (
                     <Image
                     src={getTeamLogoUrl(team.global_teams.logo_filename) || ""}
                     alt={`${team.name} logo`}
                     width={32}
                     height={32}
                     className="object-contain w-8 h-8 min-w-[32px]"
                   />
                  ) : (
                    <Trophy className="h-6 w-6 text-secondary-foreground/50" />
                  )}
                  <span>
                    <span className="text-muted-foreground">({team.global_teams.seed})</span>{" "}
                    {team.name}
                  </span>
                </TableCell>
                <TableCell>{team.is_drafted ? "Drafted" : "Available"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}

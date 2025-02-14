import { DraftPick, LeagueMember } from "@/types/draft";
import { Trophy, ArrowRight, ArrowDown, ArrowLeft } from 'lucide-react';
import Image from "next/image";
import { useMemo } from "react";

const currentPickClass = "border-2 border-primary animate-pulse";

interface DraftBoardProps {
  leagueMembers: LeagueMember[];
  draftPicks: DraftPick[];
  currentPickNumber: number;
  maxTeams: number;
  isDraftCompleted: boolean;
  currentLeagueMemberId: string
}

const getTeamLogoUrl = (filename: string | null | undefined) => {
  return filename ? `/images/team-logos/${filename}` : "";
};


const renderDraftBoard = (
  leagueMembers: LeagueMember[],
  draftPicks: DraftPick[],
  currentPickNumber: number,
  maxTeams: number,
  isDraftCompleted: boolean,
  currentLeagueMemberId: string // ✅ Pass current user ID
) => {
  const TOTAL_SLOTS = maxTeams;
  const TOTAL_ROUNDS = Math.floor(64 / maxTeams);
  const board = [];

  // Header row with member names
  const headerRow = [];
  for (let slot = 0; slot < TOTAL_SLOTS; slot++) {
    const member = leagueMembers.find((m) => m.draft_position === slot + 1);
    headerRow.push(
      <div
        key={`header-${slot}`}
        className={`p-2 font-semibold text-center truncate ${
          member?.id === currentLeagueMemberId ? "bg-primary text-white rounded-md" : ""
        }`} // ✅ Highlight current user’s team
      >
        {member ? member.team_name || member.users.display_name : "Empty"}
      </div>
    );
  }
  board.push(
    <div key="header" className="contents">
      {headerRow}
    </div>
  );

  // Draft board rows
  for (let round = 0; round < TOTAL_ROUNDS; round++) {
    const rowCells = [];
    for (let slot = 0; slot < TOTAL_SLOTS; slot++) {
      const isSnakeRound = round % 2 === 0;
      const currentSlot = isSnakeRound ? slot : TOTAL_SLOTS - slot - 1;
      const pickNumber = round * TOTAL_SLOTS + currentSlot + 1;
      const pick = draftPicks.find((p) => p.pick_number === pickNumber);
      const isLastPickOfRound = isSnakeRound ? slot === TOTAL_SLOTS - 1 : slot === 0
      const isFirstPickOfRound = isSnakeRound ? slot === 0 : slot === TOTAL_SLOTS - 1
      const isUserPick = pick?.league_member_id === currentLeagueMemberId; // ✅ Check if current user owns this pick

      rowCells.push(
        <div
          key={`${round}-${currentSlot}`}
          className={`relative bg-secondary p-2 rounded border ${
            pick ? "border-secondary-foreground/10" : "border-secondary-foreground/20"
          } ${pickNumber === currentPickNumber && !isDraftCompleted ? currentPickClass : ""}
          ${isUserPick ? "" : ""} // ✅ Highlight user's pick
          overflow-hidden`}
        >
          <div className="absolute bottom-1 left-2 text-xs text-muted-foreground">
            {pickNumber !== TOTAL_SLOTS * TOTAL_ROUNDS &&
              (isLastPickOfRound ? (
                <ArrowDown className="w-4 h-4" />
              ) : isFirstPickOfRound && round !== 0 ? (
                isSnakeRound ? (
                  <ArrowRight className="w-4 h-4" />
                ) : (
                  <ArrowLeft className="w-4 h-4" />
                )
              ) : isSnakeRound ? (
                <ArrowRight className="w-4 h-4" />
              ) : (
                <ArrowLeft className="w-4 h-4" />
              ))}
          </div>
          <div className="absolute top-1 right-2 text-xs text-muted-foreground">
            {`${round + 1}.${(currentSlot + 1).toString().padStart(2, "0")}`}
          </div>
          <div className="h-20 rounded flex flex-col items-center justify-center p-1">
            {pick ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                  {pick?.league_teams?.global_teams?.logo_filename ? (
                    <Image
                      src={getTeamLogoUrl(pick.league_teams.global_teams.logo_filename)}
                      alt={`${pick.league_teams.name} logo`}
                      width={128}
                      height={128}
                      className="object-contain"
                      loading="eager"
                      priority={true}
                      placeholder="blur"
                      blurDataURL="/icon.png"
                    />
                  ) : (
                    <Trophy className="w-24 h-24 text-secondary-foreground/50" />
                  )}
                </div>
                <div className="relative z-10 flex flex-col items-center justify-center">
                  <div
                    className={`w-12 h-12 flex items-center justify-center rounded-full bg-background/80 backdrop-blur-sm ${
                      isUserPick ? "" : ""
                    }`} // ✅ Highlight user's pick
                  >
                    {pick?.league_teams?.global_teams?.logo_filename ? (
                      <Image
                        src={getTeamLogoUrl(pick.league_teams.global_teams.logo_filename)}
                        alt={`${pick.league_teams.name} logo`}
                        width={40}
                        height={40}
                        className="object-contain"
                        loading="eager"
                        priority={true}
                        placeholder="blur"
                        blurDataURL="/icon.png"
                      />
                    ) : (
                      <Trophy className="h-6 w-6 text-secondary-foreground/50" />
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium truncate bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded ${
                      isUserPick ? "" : ""
                    }`} // ✅ Highlight user's pick
                  >
                    <span className="text-muted-foreground">({pick.league_teams?.seed})</span>{" "}
                    {pick.league_teams?.name}
                  </span>
                </div>
              </div>
            ) : (
              <span
                className={`text-xs ${
                  pickNumber === currentPickNumber && !isDraftCompleted
                    ? "text-primary font-semibold"
                    : "text-muted-foreground"
                }`}
              >
                {pickNumber === currentPickNumber && !isDraftCompleted ? "On the Clock" : ""}
              </span>
            )}
          </div>
        </div>
      );
    }
    board.push(
      <div key={round} className="contents">
        {rowCells}
      </div>
    );
  }

  return board;
};


export function DraftBoard({
  leagueMembers,
  draftPicks,
  currentPickNumber,
  maxTeams,
  isDraftCompleted,
  currentLeagueMemberId
}: DraftBoardProps) {
  const board = useMemo(
    () =>
      renderDraftBoard(
        leagueMembers,
        draftPicks,
        currentPickNumber,
        maxTeams,
        isDraftCompleted,
        currentLeagueMemberId
      ),
    [leagueMembers, draftPicks, currentPickNumber, maxTeams, isDraftCompleted, currentLeagueMemberId]
  );

  return (
    <div
      className="gap-1 min-w-[800px]"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${maxTeams}, minmax(0, 1fr))`,
      }}
    >
      {board}
    </div>
  );
}


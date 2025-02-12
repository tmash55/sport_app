import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import type { Matchup, LeagueMember } from "@/types/draft"

interface DraftMatchProps {
  match: Matchup
  roundIndex: number
  matchIndex: number
  direction?: "ltr" | "rtl"
  isSpecial?: boolean
  currentUser: string
  leagueMembers: LeagueMember[]
}

export function DraftMatch({
  match,
  roundIndex,
  matchIndex,
  direction = "ltr",
  isSpecial = false,
  currentUser,
  leagueMembers,
}: DraftMatchProps) {
  const { theme } = useTheme()
  const isRtl = direction === "rtl"
  const isRoundOne = roundIndex === 0

  return (
    <Card
      className={cn(
        "w-[90px] sm:w-[110px] h-[60px] sm:h-[70px] flex flex-col justify-center transition-all duration-300 overflow-hidden",
        isRoundOne && "w-[100px] sm:w-[120px] h-[70px] sm:h-[80px]",
        isSpecial && "w-[110px] sm:w-[130px] h-[70px] sm:h-[80px] shadow-lg",
      )}
    >
      <CardContent className="p-0">
        <DraftTeamInfo
          team={match.home_team}
          position="top"
          direction={direction}
          isSpecial={isSpecial}
          isRoundOne={isRoundOne}
          currentUser={currentUser}
          drafted_owner={match.drafted_home_owner}
          leagueMembers={leagueMembers}
        />
        <DraftTeamInfo
          team={match.away_team}
          position="bottom"
          direction={direction}
          isSpecial={isSpecial}
          isRoundOne={isRoundOne}
          currentUser={currentUser}
          drafted_owner={match.drafted_away_owner}
          leagueMembers={leagueMembers}
        />
      </CardContent>
    </Card>
  )
}

interface DraftTeamInfoProps {
  team: Matchup["home_team"] | Matchup["away_team"]
  position: "top" | "bottom"
  direction?: "ltr" | "rtl"
  isSpecial?: boolean
  isRoundOne?: boolean
  currentUser: string
  drafted_owner: string | null
  leagueMembers: LeagueMember[]
}

function DraftTeamInfo({
  team,
  position,
  direction = "ltr",
  isSpecial = false,
  isRoundOne = false,
  currentUser,
  drafted_owner,
  leagueMembers,
}: DraftTeamInfoProps) {
  const isRtl = direction === "rtl"
  const isDrafted = drafted_owner !== null
  const currentUserMember = leagueMembers.find((member) => member.id === currentUser)
  const isUserTeam = currentUserMember?.team_name === drafted_owner

  console.log("League members:", leagueMembers)
  console.log("CurrentUserMember:", currentUserMember)
  console.log("CurrentUser:", currentUser)

  if (!team) {
    return (
      <div
        className={cn(
          "flex items-center justify-center space-x-1 px-1 py-0.5 relative h-[30px] sm:h-[35px] w-full",
          isRoundOne && "h-[35px] sm:h-[40px]",
          position === "top" && "border-b border-border rounded-t-lg",
          position === "bottom" && "rounded-b-lg",
          isSpecial && "h-[35px] sm:h-[40px]",
        )}
      >
        <span className="text-[8px] sm:text-[10px] text-muted-foreground">TBD</span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex items-center space-x-1 px-2 py-1 relative h-[30px] sm:h-[35px] w-full transition-colors",
        isRoundOne && "h-[35px] sm:h-[40px]",
        position === "top" && "border-b border-border rounded-t-lg",
        position === "bottom" && "rounded-b-lg",
        isSpecial && "h-[35px] sm:h-[40px]",
        !isDrafted && "bg-green-500/40 ring-1 ring-slate-400",
        isDrafted && !isUserTeam && "opacity-70 bg-red-500 ring-1 ring-border",
        isUserTeam && "bg-primary/20 ring-2 ring-primary shadow-sm",
      )}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div
          className={cn(
            "w-4 h-4 sm:w-5 sm:h-5 relative flex-shrink-0",
            isRoundOne && "w-5 h-5 sm:w-6 sm:h-6",
            isSpecial && "w-5 h-5 sm:w-6 sm:h-6",
          )}
        >
          {team.logo_filename ? (
            <Image
              src={`/images/team-logos/${team.logo_filename}`}
              alt={`${team.name} logo`}
              fill
              style={{ objectFit: "cover" }}
              sizes="(max-width: 640px) 16px, 20px"
              className={cn("rounded-full", isDrafted && !isUserTeam && "grayscale")}
            />
          ) : (
            <div
              className={cn(
                "w-4 h-4 sm:w-5 sm:h-5 bg-gray-200 rounded-full flex items-center justify-center text-[8px] sm:text-[10px] font-medium",
                isRoundOne && "w-5 h-5 sm:w-6 sm:h-6",
                isSpecial && "w-5 h-5 sm:w-6 sm:h-6",
              )}
            >
              {team.seed}
            </div>
          )}
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span
            className={cn(
              "text-[8px] sm:text-[10px] leading-tight truncate",
              isRoundOne && "text-[10px] sm:text-[12px]",
              isSpecial && "text-[10px] sm:text-[12px]",
              !isDrafted && "font-medium",
              isDrafted && !isUserTeam && "",
              isUserTeam && "text-primary font-medium",
            )}
          >
            {team.seed} {team.name}
          </span>
          <span
            className={cn(
              "text-[6px] sm:text-[6px] leading-tight truncate",
              isRoundOne && "text-[8px] sm:text-[10px]",
              !isDrafted && "text-green-600 dark:text-green-400 font-medium",
              isDrafted && !isUserTeam && "",
              isUserTeam && "text-primary font-medium",
            )}
          >
            {isDrafted ? (isUserTeam ? "You" : drafted_owner) : "Available"}
          </span>
        </div>
      </div>
    </div>
  )
}



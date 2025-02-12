"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Trophy, Star } from "lucide-react"
import { useLeague } from "@/app/context/LeagueContext"
import { Region } from "./Region"
import { Button } from "@/components/ui/button"
import { ChevronDownIcon } from "lucide-react"
import { Match } from "./Match"

export function Bracket() {
  const { leagueData, matchups, isLoading, error } = useLeague()
  const [selectedMemberId, setSelectedMemberId] = useState<string>(() => {
    const currentUserMember = leagueData?.league_members.find((m: any) => m.user_id === leagueData?.user_id)
    return currentUserMember ? currentUserMember.id : leagueData?.league_members[0]?.id || ""
  })
  const selectedMember = leagueData?.league_members.find((m: any) => m.id === selectedMemberId)

  if (isLoading || !leagueData) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error loading bracket data</div>
  }

  const getUserTeams = (memberId: string | null) => {
    if (!leagueData) return []
    const member = leagueData.league_members.find((m: any) => m.id === memberId)
    if (!member) return []
    return leagueData.draft_picks
      .filter((pick: any) => pick.league_member_id === member.id)
      .map((pick: any) => pick.league_teams.global_teams.id)
  }

  const userTeamIds = getUserTeams(selectedMemberId)

  const getTeamOwner = (teamId: string) => {
    const draftPick = leagueData.draft_picks.find((pick: any) => pick.league_teams.global_teams.id === teamId)
    if (draftPick) {
      const leagueMember = leagueData.league_members.find((member: any) => member.id === draftPick.league_member_id)
      return leagueMember ? leagueMember.team_name || leagueMember.users.display_name : "Undrafted"
    }
    return "Undrafted"
  }

  const bracketData: { [key: string]: { [key: number]: any[] } } = {
    East: {},
    West: {},
    South: {},
    Midwest: {},
    "Final Four": {},
    Championship: {},
  }

  matchups.forEach((match) => {
    const region = match.region || "Undrafted"
    const round = match.round
    if (!bracketData[region]) {
      bracketData[region] = {}
    }
    if (!bracketData[region][round]) {
      bracketData[region][round] = []
    }
    bracketData[region][round].push(match)
  })

  return (
    <Card className="w-full">
      <CardContent className="p-2 sm:p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h2 className="text-lg font-semibold">Tournament Bracket</h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full sm:w-[250px] justify-start font-medium border-2 hover:border-primary/50 transition-colors"
              >
                <span className="truncate">
                  {selectedMember?.team_name || selectedMember?.users.display_name || "Select Team"}
                </span>
                <ChevronDownIcon className="ml-auto h-4 w-4 shrink-0 opacity-50 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[250px]">
              {leagueData?.league_members.map((member: any) => (
                <DropdownMenuItem
                  key={member.id}
                  onSelect={() => setSelectedMemberId(member.id)}
                  className="font-medium"
                >
                  {member.team_name || member.users.display_name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <ScrollArea className="w-full rounded-lg">
          <div className="min-w-[300px] w-full max-w-[1400px] mx-auto px-2 sm:px-4">
            <div className="space-y-6 sm:space-y-8 lg:space-y-16">
              {/* Top Regions: East and South */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 mb-6 sm:mb-8 lg:mb-16">
                <Region
                  name="East"
                  matchups={bracketData["East"]}
                  direction="ltr"
                  userTeamIds={userTeamIds}
                  getTeamOwner={getTeamOwner}
                />
                <Region
                  name="South"
                  matchups={bracketData["South"]}
                  direction="rtl"
                  userTeamIds={userTeamIds}
                  getTeamOwner={getTeamOwner}
                />
              </div>

              {/* Middle: Final Four and Championship */}
              <div className="flex flex-col items-center gap-4 mt-8 sm:mt-12 lg:mt-16 mb-6 sm:mb-8 lg:mb-16">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 items-center max-w-5xl mx-auto pt-8 sm:pt-16 lg:pt-8">
                  {/* Left Final Four */}
                  <div className="relative">
                    <FinalFourMatch
                      match={bracketData["Final Four"]?.[5]?.[0] || null}
                      userTeamIds={userTeamIds}
                      getTeamOwner={getTeamOwner}
                    />
                  </div>

                  {/* Championship */}
                  <div className="relative px-2 sm:px-4">
                    <ChampionshipMatch
                      match={bracketData["Championship"]?.[6]?.[0] || null}
                      userTeamIds={userTeamIds}
                      getTeamOwner={getTeamOwner}
                    />
                  </div>

                  {/* Right Final Four */}
                  <div className="relative">
                    <FinalFourMatch
                      match={bracketData["Final Four"]?.[5]?.[1] || null}
                      userTeamIds={userTeamIds}
                      getTeamOwner={getTeamOwner}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Regions: West and Midwest */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                <Region
                  name="West"
                  matchups={bracketData["West"]}
                  direction="ltr"
                  userTeamIds={userTeamIds}
                  getTeamOwner={getTeamOwner}
                />
                <Region
                  name="Midwest"
                  matchups={bracketData["Midwest"]}
                  direction="rtl"
                  userTeamIds={userTeamIds}
                  getTeamOwner={getTeamOwner}
                />
              </div>
            </div>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

function FinalFourMatch({
  match,
  userTeamIds,
  getTeamOwner,
}: {
  match: any
  userTeamIds: string[]
  getTeamOwner: (teamId: string) => string
}) {
  if (!match) return null

  return (
    <div className="w-full flex flex-col items-center">
      <div className="relative mb-2 sm:mb-4">
        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-center mb-1 sm:mb-2 bg-gradient-to-r from-yellow-500 via-yellow-300 to-yellow-500 bg-clip-text text-transparent">
          FINAL FOUR
        </h3>
      </div>
      <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-4">Apr 5</p>
      <div className="bg-gradient-to-br from-yellow-100 via-yellow-50 to-white rounded-lg p-3 sm:p-4 lg:p-6 w-full max-w-[250px] shadow-lg relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-200/20 via-yellow-100/10 to-transparent pointer-events-none" />
        <div className="relative z-50 flex justify-center">
          <Match
            match={match}
            roundIndex={4}
            matchIndex={0}
            isSpecial={true}
            userTeamIds={userTeamIds}
            getTeamOwner={getTeamOwner}
          />
        </div>
        <div className="absolute -bottom-6 -right-6 transform rotate-12">
          <Trophy className="text-yellow-300 w-12 sm:w-16 h-12 sm:h-16 opacity-20" />
        </div>
      </div>
    </div>
  )
}

function ChampionshipMatch({
  match,
  userTeamIds,
  getTeamOwner,
}: {
  match: any
  userTeamIds: string[]
  getTeamOwner: (teamId: string) => string
}) {
  if (!match) return null

  return (
    <div className="w-full">
      <div className="flex flex-col items-center">
        <div className="relative mb-2 sm:mb-4">
          <h3 className="text-xl sm:text-3xl lg:text-4xl font-bold text-center mb-1 sm:mb-2 bg-gradient-to-r from-yellow-500 via-yellow-300 to-yellow-500 bg-clip-text text-transparent">
            Championship
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-4">San Antonio, TX</p>
        <div className="bg-gradient-to-br from-yellow-200 via-yellow-100 to-white rounded-lg p-4 sm:p-6 lg:p-8 w-full max-w-[320px] shadow-xl relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-300/40 via-yellow-200/30 to-transparent pointer-events-none" />
          <div className="relative z-10 flex justify-center">
            <Match
              match={match}
              roundIndex={5}
              matchIndex={0}
              isSpecial={true}
              userTeamIds={userTeamIds}
              getTeamOwner={getTeamOwner}
            />
          </div>
          <div className="absolute -bottom-8 -right-8 transform rotate-12">
            <Trophy className="text-yellow-400 w-16 sm:w-24 h-16 sm:h-24 opacity-30" />
          </div>
        </div>
      </div>
    </div>
  )
}


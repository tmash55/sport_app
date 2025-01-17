import { Database } from "@/types/database";

type GlobalTeam = Database["public"]["Tables"]["global_teams"]["Row"];
type LeagueSettings = Database["public"]["Tables"]["league_settings"]["Row"];

export function calculateTeamScore(team: GlobalTeam, settings: LeagueSettings): number {
  let score = 0;
  const rounds = [
    { win: team.round_1_win, points: settings.round_1_score },
    { win: team.round_2_win, points: settings.round_2_score },
    { win: team.round_3_win, points: settings.round_3_score },
    { win: team.round_4_win, points: settings.round_4_score },
    { win: team.round_5_win, points: settings.round_5_score },
    { win: team.round_6_win, points: settings.round_6_score },
  ];

  rounds.forEach((round, index) => {
    if (round.win) {
      score += round.points;
      
      // Check for upset
      const opponentSeed = getOpponentSeed(team.seed, index + 1);
      if (team.seed > opponentSeed) {
        const upsetPoints = (team.seed - opponentSeed) * settings.upset_multiplier;
        score += upsetPoints;
      }
    }
  });

  return score;
}

function getOpponentSeed(teamSeed: number, round: number): number {
  switch (round) {
    case 1: return 17 - teamSeed;
    case 2: return teamSeed % 2 === 0 ? teamSeed - 1 : teamSeed + 1;
    case 3: return [1, 16, 8, 9, 5, 12, 4, 13, 6, 11, 3, 14, 7, 10, 2, 15][Math.floor((teamSeed - 1) / 4) * 4];
    case 4: return [1, 8, 4, 5, 2, 7, 3, 6][Math.floor((teamSeed - 1) / 8) * 2];
    case 5: return [1, 4, 2, 3][Math.floor((teamSeed - 1) / 4)];
    case 6: return teamSeed <= 2 ? 3 - teamSeed : 7 - teamSeed;
    default: return 1;
  }
}


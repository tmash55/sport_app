export interface LeagueMember {
  id: string;
  user_id: string;
  draft_position: number | null;
  team_name: string | null;
  users: {
    email: string;
    first_name: string | null;
    last_name: string | null;
    display_name: string | null;
  };
}

export interface GlobalTeam {
  id: string;
  name: string;
  seed: number;
  created_at: string;
  logo_filename: string;
}

export interface LeagueTeam {
  id: string;
  global_team_id: string;
  league_id: string;
  name: string;
  seed: number;
  created_at: string;
  global_teams: GlobalTeam;
}

export interface DraftPick {
  id: string;
  user_id: string;
  team_id: string;
  pick_number: number;
  draft_id: string;
  league_teams: LeagueTeam;
  league_member_id: string;
  users: {
    email: string;
    first_name: string | null;
    last_name: string | null;
  };
}

export interface Draft {
  id: string;
  league_id: string;
  status: 'pre_draft' | 'in_progress' | 'paused' | 'completed';
  current_pick_number: number;
  start_time: string | null;
  end_time: string | null;
  draft_pick_timer: number;
  timer_expires_at: string | null;
}

export interface LeagueSettings {
  id: string;
  league_id: string;
  round_1_score: number;
  round_2_score: number;
  round_3_score: number;
  round_4_score: number;
  round_5_score: number;
  round_6_score: number;
  upset_multiplier: number;
}



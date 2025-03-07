export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      leagues: {
        Row: {
          id: string
          name: string
          commissioner_id: string
          created_at: string
          max_teams: number
          draft_start_time: string | null
          draft_pick_timer: number
        }
        Insert: {
          id?: string
          name: string
          commissioner_id: string
          created_at?: string
          max_teams?: number
          draft_start_time?: string | null
          draft_pick_timer?: number
        }
        Update: {
          id?: string
          name?: string
          commissioner_id?: string
          created_at?: string
          max_teams?: number
          draft_start_time?: string | null
          draft_pick_timer?: number
        }
      }
      league_members: {
        Row: {
          id: string
          league_id: string
          user_id: string
          joined_at: string
          draft_position: number | null
        }
        Insert: {
          id?: string
          league_id: string
          user_id: string
          joined_at?: string
          draft_position?: number | null
        }
        Update: {
          id?: string
          league_id?: string
          user_id?: string
          joined_at?: string
          draft_position?: number | null
        }
      }
      league_settings: {
        Row: {
          id: string
          league_id: string
          round_1_score: number
          round_2_score: number
          round_3_score: number
          round_4_score: number
          round_5_score: number
          round_6_score: number
          upset_multiplier: number
          created_at: string
        }
        Insert: {
          id?: string
          league_id: string
          round_1_score: number
          round_2_score: number
          round_3_score: number
          round_4_score: number
          round_5_score: number
          round_6_score: number
          upset_multiplier: number
          created_at?: string
        }
        Update: {
          id?: string
          league_id?: string
          round_1_score?: number
          round_2_score?: number
          round_3_score?: number
          round_4_score?: number
          round_5_score?: number
          round_6_score?: number
          upset_multiplier?: number
          created_at?: string
        }
      }
      global_teams: {
        Row: {
          id: string
          name: string
          seed: number
          created_at: string
          round_1_win: boolean
          round_2_win: boolean
          round_3_win: boolean
          round_4_win: boolean
          round_5_win: boolean
          round_6_win: boolean
        }
        Insert: {
          id?: string
          name: string
          seed: number
          created_at?: string
          round_1_win?: boolean
          round_2_win?: boolean
          round_3_win?: boolean
          round_4_win?: boolean
          round_5_win?: boolean
          round_6_win?: boolean
        }
        Update: {
          id?: string
          name?: string
          seed?: number
          created_at?: string
          round_1_win?: boolean
          round_2_win?: boolean
          round_3_win?: boolean
          round_4_win?: boolean
          round_5_win?: boolean
          round_6_win?: boolean
        }
      }

      league_teams: {
        Row: {
          id: string
          global_team_id: string
          league_id: string
          name: string
          seed: number
          created_at: string
        }
        Insert: {
          id?: string
          global_team_id: string
          league_id: string
          name: string
          seed: number
          created_at?: string
        }
        Update: {
          id?: string
          global_team_id?: string
          league_id?: string
          name?: string
          seed?: number
          created_at?: string
        }
      }
      draft_picks: {
        Row: {
          id: string
          league_id: string
          user_id: string
          team_id: string
          pick_number: number
          created_at: string
        }
        Insert: {
          id?: string
          league_id: string
          user_id: string
          team_id: string
          pick_number: number
          created_at?: string
        }
        Update: {
          id?: string
          league_id?: string
          user_id?: string
          team_id?: string
          pick_number?: number
          created_at?: string
        }
      }
      games: {
        Row: {
          id: string
          league_id: string
          team1_id: string
          team2_id: string
          score_team1: number | null
          score_team2: number | null
          round: number
          game_date: string
        }
        Insert: {
          id?: string
          league_id: string
          team1_id: string
          team2_id: string
          score_team1?: number | null
          score_team2?: number | null
          round: number
          game_date: string
        }
        Update: {
          id?: string
          league_id?: string
          team1_id?: string
          team2_id?: string
          score_team1?: number | null
          score_team2?: number | null
          round?: number
          game_date?: string
        }
      }
      scores: {
        Row: {
          id: string
          game_id: string
          team_id: string
          points: number
        }
        Insert: {
          id?: string
          game_id: string
          team_id: string
          points: number
        }
        Update: {
          id?: string
          game_id?: string
          team_id?: string
          points?: number
        }
      }
      league_team_stats: {
        Row: {
          id: string
          league_id: string
          team_id: string
          round1_win: boolean | null
          round2_win: boolean | null
          round3_win: boolean | null
          round1_upset: number | null
          round2_upset: number | null
          round3_upset: number | null
          created_at: string
        }
        Insert: {
          id?: string
          league_id: string
          team_id: string
          round1_win?: boolean | null
          round2_win?: boolean | null
          round3_win?: boolean | null
          round1_upset?: number | null
          round2_upset?: number | null
          round3_upset?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          league_id?: string
          team_id?: string
          round1_win?: boolean | null
          round2_win?: boolean | null
          round3_win?: boolean | null
          round1_upset?: number | null
          round2_upset?: number | null
          round3_upset?: number | null
          created_at?: string
        }
      }
      user_scores: {
        Row: {
          id: string
          league_id: string
          user_id: string
          total_points: number
          created_at: string
        }
        Insert: {
          id?: string
          league_id: string
          user_id: string
          total_points: number
          created_at?: string
        }
        Update: {
          id?: string
          league_id?: string
          user_id?: string
          total_points?: number
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
export interface GlobalTeam {
  id: string;
  name: string;
  seed: number;
  created_at: string;
  round_1_win: boolean;
  round_2_win: boolean;
  round_3_win: boolean;
  round_4_win: boolean;
  round_5_win: boolean;
  round_6_win: boolean;
}

export interface LeagueTeam {
  id: string;
  global_team_id: string;
  league_id: string;
  name: string;
  seed: number;
  created_at: string;
  global_teams?: GlobalTeam;
}

export interface DraftPick {
  id: string;
  draft_id: string,
  league_member: string,
  league_id: string;
  user_id: string;
  league_member_id: string; 
  team_id: string;
  pick_number: number;
  created_at: string;
  league_teams?: LeagueTeam;
  users?: {
    email: string;
    first_name: string;
    last_name: string;
  };
}

export interface LeagueMember {
  id: string;
  league_id: string;
  user_id: string;
  joined_at: string;
  team_name: string;
  draft_position: number | null;
  users: {
    email: string;
    first_name: string;
    last_name: string;
    display_name: string;
  };
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
  created_at: string;
}



import useSWR from 'swr';
import { fetchFromSupabase } from '@/libs/fetcher';

export function useLeagueMembers(leagueId: string) {
  return useSWR(
    leagueId ? [`league_members`, leagueId] : null,
    async () =>
      fetchFromSupabase((supabase: any) =>
        supabase
          .from('league_members')
          .select(`
            id,
            user_id,
            draft_position,
            team_name,
            users (
              display_name,
              email
            )
          `)
          .eq('league_id', leagueId)
          .order('draft_position', { ascending: true, nullsLast: true })
      )
  );
}

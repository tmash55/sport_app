import { useQuery } from 'react-query'
import { createClient } from '@/libs/supabase/client'
import { User } from '@supabase/supabase-js'

export function useUser() {
  const supabase = createClient()

  return useQuery<{ user: User | null; displayName: string }, Error>(
    'user',
    async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        return { user: null, displayName: '' }
      }

      const { data } = await supabase
        .from('users')
        .select('display_name')
        .eq('id', user.id)
        .single()

      const displayName = data?.display_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'

      return { user, displayName }
    },
    {
      staleTime: 300000, // 5 minutes
      cacheTime: 3600000, // 1 hour
    }
  )
}


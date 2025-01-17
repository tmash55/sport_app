import { createClient } from '@/libs/supabase/client'

// Simple in-memory cache
const usernameCache = new Map<string, boolean>();

export async function isUsernameAvailable(username: string): Promise<boolean> {
  // Check cache first
  if (usernameCache.has(username)) {
    return usernameCache.get(username)!;
  }

  const supabase = createClient()
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('display_name', username)
    .single()

  const isAvailable = !data && error && error.code === 'PGRST116';
  
  // Update cache
  usernameCache.set(username, isAvailable);

  // Clear cache after 5 minutes to prevent stale data
  setTimeout(() => usernameCache.delete(username), 5 * 60 * 1000);

  return isAvailable;
}

// Debounce function
export function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<F>): Promise<ReturnType<F>> => {
    return new Promise((resolve) => {
      if (timeout !== null) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => resolve(func(...args)), waitFor);
    });
  };
}


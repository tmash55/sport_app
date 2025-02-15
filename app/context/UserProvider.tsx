"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/libs/supabase/client"
import type { User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
import config from "@/config"

// Create Supabase client once (outside the component)
const supabase = createClient();

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // 🔹 First check if we have a session before making an extra API call
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;
        if (!session?.user) {
          router.push(config.auth.loginUrl);
          return;
        }

        // 🔹 Fetch full user details only if session exists
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        setUser(data.user);
      } catch (e) {
        setError(e instanceof Error ? e : new Error("An unknown error occurred"));
        router.push(config.auth.loginUrl);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === "SIGNED_OUT") {
        router.push(config.auth.loginUrl);
      }
    });

    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [router]);

  return <UserContext.Provider value={{ user, isLoading, error }}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

import { useState, useEffect } from "react"
import { createClient } from "@/libs/supabase/client"

export function useServerTime() {
  const [serverTimeOffset, setServerTimeOffset] = useState<number | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchServerTime = async () => {
      const { data, error } = await supabase.rpc("get_server_time")

      if (!error && data) {
        // Calculate time difference (drift)
        const serverTimestamp = new Date(data).getTime()
        const clientTimestamp = Date.now()
        setServerTimeOffset(serverTimestamp - clientTimestamp)
      }
    }

    fetchServerTime()

    // Optional: Refresh every 5 minutes to minimize drift
    const interval = setInterval(fetchServerTime, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [supabase])

  return serverTimeOffset
}

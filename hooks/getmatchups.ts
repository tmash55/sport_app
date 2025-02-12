import { createClient } from "@/libs/supabase/client";
import { useEffect, useState } from "react";


const useMatchups = (leagueId: string) => {
  const [matchups, setMatchups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);  // ✅ Change to Error | null
  const supabase = createClient()

  const fetchMatchups = async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.rpc("get_matchups", {
      p_league_id: leagueId,
    });

    if (error) {
      console.error("Error fetching matchups:", error);
      setError(new Error(error.message));  // ✅ Wrap message inside an Error object
    } else {
      setMatchups(data);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchMatchups();

    // Optional: Subscribe to live updates
    const subscription = supabase
      .channel("draft_picks_updates")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "draft_picks" },
        () => {
          console.log("Draft pick updated, refetching matchups...");
          fetchMatchups();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [leagueId]);

  return { matchups, loading, error };
};

export default useMatchups;

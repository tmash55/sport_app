import { createClient } from "./supabase/client";


const supabase = createClient();

export async function fetchFromSupabase(queryFn: any) {
  const { data, error } = await queryFn(supabase);
  if (error) throw new Error(error.message);
  return data;
}

import { createClient } from "@/libs/supabase/client";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();}
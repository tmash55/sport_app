import { createClient } from '@/libs/supabase/client';
import { NextResponse } from 'next/server';



const supabase = createClient();

export async function POST(req: Request) {
  try {
    const { name, commissioner_id, max_teams } = await req.json();

    if (!name || !commissioner_id || !max_teams) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Insert into leagues table (trigger handles league_settings)
    const { data: leagueData, error: leagueError } = await supabase
      .from("leagues")
      .insert([{ name, commissioner_id, max_teams }])
      .select()
      .single();

    if (leagueError) {
      throw new Error(leagueError.message);
    }

    const leagueId = leagueData.id;

    // Prepare league_members records
    const leagueMembers = Array.from({ length: max_teams }, (_, i) => ({
      league_id: leagueId,
      user_id: i === 0 ? commissioner_id : null, // Commissioner gets the first spot
      joined_at: null,
      draft_position: null,
      team_name: null,
      avatar_url: null,
    }));

    // Insert into league_members
    const { error: membersError } = await supabase.from("league_members").insert(leagueMembers);

    if (membersError) {
      throw new Error(membersError.message);
    }

    return NextResponse.json({ leagueId }, { status: 201 });
  } catch (error) {
    console.error("Error creating league:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}



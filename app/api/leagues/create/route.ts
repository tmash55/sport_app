import { createClient } from '@/libs/supabase/client';
import { NextResponse } from 'next/server';



const supabase = createClient();

export async function POST(req: Request) {
  try {
    const { name, commissioner_id } = await req.json();

    if (!name || !commissioner_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('leagues')
      .insert([{ name, commissioner_id }]);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';


export async function POST(request: Request) {
  const { contestType, contestId, leagueName, userId } = await request.json();

  if (!contestType || !contestId || !leagueName || !userId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  
}

import { NextResponse } from 'next/server';
import { ContestFactory } from '@/lib/contestFactory';

export async function POST(request: Request) {
  const { contestType, contestId, leagueName, userId } = await request.json();

  if (!contestType || !contestId || !leagueName || !userId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const contestHandler = ContestFactory.getContestHandler(contestType);

    if (!contestHandler) {
      return NextResponse.json({ error: 'Invalid contest type' }, { status: 400 });
    }

    const defaultSettings = contestHandler.getDefaultSettings();
    const league = await contestHandler.createLeague(userId, contestId, leagueName, defaultSettings);

    return NextResponse.json({ league }, { status: 200 });
  } catch (error) {
    console.error('Error handling contest creation:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

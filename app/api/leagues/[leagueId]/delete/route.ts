

import { createClient } from '@/libs/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE(
  request: Request,
  { params }: { params: { leagueId: string } }
) {
  

  const supabase = createClient()

  try {
    // Check if the user is authenticated and is the commissioner
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { data: league, error: leagueError } = await supabase
      .from('leagues')
      .select('commissioner_id')
      .eq('id', params.leagueId)
      .single()

    if (leagueError) {
      return NextResponse.json({ error: 'League not found' }, { status: 404 })
    }

    if (league.commissioner_id !== user.id) {
      return NextResponse.json({ error: 'Not authorized to delete this league' }, { status: 403 })
    }

    // Delete the league (this will cascade to related tables due to our new constraints)
    const { error: deleteError } = await supabase
      .from('leagues')
      .delete()
      .eq('id', params.leagueId)

    if (deleteError) {
      console.error('Error deleting league:', deleteError)
      return NextResponse.json({ error: 'Failed to delete league' }, { status: 500 })
    }

    // After successfully deleting the league
    const { error: broadcastError } = await supabase
      .from('leagues')
      .delete()
      .eq('id', params.leagueId)
      .select()

    if (broadcastError) {
      console.error('Error broadcasting league deletion:', broadcastError)
    }

    return NextResponse.json({ message: 'League deleted successfully' })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}


import { createClient } from '@/libs/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE(
  request: Request,
  { params }: { params: { leagueId: string } }
) {
  const supabase = createClient()

  try {
    // Check if the user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Call the delete_league function
    const { data, error } = await supabase.rpc('delete_league', {
      p_league_id: params.leagueId,
      p_user_id: user.id
    })

    if (error) {
      if (error.message.includes('User is not authorized')) {
        return NextResponse.json({ error: 'Not authorized to delete this league' }, { status: 403 })
      }
      console.error('Error deleting league:', error)
      return NextResponse.json({ error: 'Failed to delete league' }, { status: 500 })
    }

    // If the deletion was successful, data will be true
    if (data) {
      // Optionally, you can broadcast the change here if needed
      // This step might not be necessary if you're using real-time subscriptions elsewhere in your app
      const { error: broadcastError } = await supabase
        .from('leagues')
        .delete()
        .eq('id', params.leagueId)
        .select()

      if (broadcastError) {
        console.error('Error broadcasting league deletion:', broadcastError)
      }

      return NextResponse.json({ message: 'League deleted successfully' })
    } else {
      return NextResponse.json({ error: 'Failed to delete league' }, { status: 500 })
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}


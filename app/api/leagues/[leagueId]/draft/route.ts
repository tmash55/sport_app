import { createClient } from '@/libs/supabase/client'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: { leagueId: string } }
) {
  const { leagueId } = params
  const { action, teamId } = await request.json()

  const supabase = createClient()

  // Check if the user is authenticated
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch the draft for the league
  const { data: draft, error: draftError } = await supabase
    .from('drafts')
    .select('*')
    .eq('league_id', leagueId)
    .single()

  if (draftError) {
    return NextResponse.json({ error: 'Failed to fetch draft' }, { status: 500 })
  }

  // Perform the requested action
  switch (action) {
    case 'draft_pick':
      if (draft.status !== 'in_progress') {
        return NextResponse.json({ error: 'Draft is not in progress' }, { status: 400 })
      }

      // Fetch the league_member_id for the current user and league
      const { data: leagueMember, error: leagueMemberError } = await supabase
        .from('league_members')
        .select('id')
        .eq('league_id', leagueId)
        .eq('user_id', session.user.id)
        .single()

      if (leagueMemberError) {
        return NextResponse.json({ error: 'Failed to fetch league member' }, { status: 500 })
      }

      const { data: pick, error: pickError } = await supabase
        .from('draft_picks')
        .insert({
          draft_id: draft.id,
          user_id: session.user.id,
          league_member_id: leagueMember.id,
          team_id: teamId,
          pick_number: draft.current_pick_number
        })
        .select()
        .single()

      if (pickError) {
        return NextResponse.json({ error: 'Failed to make draft pick' }, { status: 500 })
      }

      // Update the current pick number
      const { error: updateError } = await supabase
        .from('drafts')
        .update({ current_pick_number: draft.current_pick_number + 1 })
        .eq('id', draft.id)

      if (updateError) {
        return NextResponse.json({ error: 'Failed to update draft' }, { status: 500 })
      }

      return NextResponse.json({ message: 'Draft pick made successfully', pick })

    case 'start':
      const { data: draftStart, error: draftErrorStart } = await supabase
        .from('drafts')
        .insert({
          league_id: leagueId,
          status: 'in_progress',
          start_time: new Date().toISOString()
        })
        .select()
        .single()

      if (draftErrorStart) {
        return NextResponse.json({ error: 'Failed to start draft' }, { status: 500 })
      }

      return NextResponse.json({ message: 'Draft started', draft: draftStart })

    case 'pause':
    case 'resume':
      const newStatus = action === 'pause' ? 'paused' : 'in_progress'
      const { error: updateErrorPauseResume } = await supabase
        .from('drafts')
        .update({ status: newStatus })
        .eq('league_id', leagueId)

      if (updateErrorPauseResume) {
        return NextResponse.json({ error: `Failed to ${action} draft` }, { status: 500 })
      }

      return NextResponse.json({ message: `Draft ${action}d` })

    case 'complete':
      const { error: completeError } = await supabase
        .from('drafts')
        .update({
          status: 'completed',
          end_time: new Date().toISOString()
        })
        .eq('league_id', leagueId)

      if (completeError) {
        return NextResponse.json({ error: 'Failed to complete draft' }, { status: 500 })
      }

      return NextResponse.json({ message: 'Draft completed' })

    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }
}


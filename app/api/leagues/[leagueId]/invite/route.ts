import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { sendInviteEmail } from '@/lib/email'

export async function POST(
  request: Request,
  { params }: { params: { leagueId: string } }
) {
  const cookieStore = cookies()

  try {
    if (!params.leagueId || params.leagueId === 'undefined') {
      console.error('Invalid leagueId:', params.leagueId);
      return NextResponse.json({ error: 'Invalid league ID' }, { status: 400 })
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    // Check if the user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Fetch league details and check if the user is the commissioner
    const { data: league, error: leagueError } = await supabase
      .from('leagues')
      .select('commissioner_id, name')
      .eq('id', params.leagueId)
      .single()

    if (leagueError || !league) {
      console.error('Error fetching league:', leagueError);
      return NextResponse.json({ error: 'League not found' }, { status: 404 })
    }

    if (league.commissioner_id !== user.id) {
      return NextResponse.json({ error: 'Not authorized to send invites for this league' }, { status: 403 })
    }

    // Get the email from the request body
    const { email } = await request.json()

    // Generate a unique token
    const token = crypto.randomBytes(32).toString('hex')

    // Set expiration to 7 days from now
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    // Insert the invite into the database
    const { data: invite, error: inviteError } = await supabase
      .from('invites')
      .insert({
        league_id: params.leagueId,
        email,
        token,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single()

    if (inviteError) {
      console.error('Error creating invite:', inviteError)
      return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 })
    }

    // Generate invite link
    const inviteLink = `${process.env.NEXT_PUBLIC_BASE_URL}/invite/${token}`

    // Send email using sendInviteEmail function
    try {
      console.log('Attempting to send email to:', email, 'with invite link:', inviteLink, 'for league:', league.name)
      await sendInviteEmail(email, inviteLink, league.name)
      console.log('Email sent successfully')
    } catch (emailError) {
      console.error('Error sending invite email:', JSON.stringify(emailError, null, 2))
      return NextResponse.json({ 
        success: true, 
        invite, 
        warning: "Invite created but email could not be sent. Please try again or contact support."
      })
    }

    return NextResponse.json({ success: true, invite })
  } catch (error) {
    console.error('Unexpected error:', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}

// Add a GET handler for easier testing in the browser
export async function GET(
  request: Request,
  { params }: { params: { leagueId: string } }
) {
  console.log('GET: API route hit');
  console.log('leagueId:', params.leagueId);

  return NextResponse.json({ message: 'GET: Invite API route hit successfully' })
}


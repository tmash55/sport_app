import { createClient } from '@/libs/supabase/server'
import React from "react"
import { redirect } from 'next/navigation'

export default async function DraftLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: { leagueid: string }
}) {

  const supabase = createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/sign-in')
  }

  // Check if the user is a member of the league
  const { data: leagueMember, error: leagueMemberError } = await supabase
    .from('league_members')
    .select('id')
    .eq('league_id', params.leagueid)
    .eq('user_id', user.id)
    .single()

  if (leagueMemberError || !leagueMember) {
    redirect('/dashboard')
  }

  return (
    <div className="h-screen bg-background">
      {children}
    </div>
  )
}


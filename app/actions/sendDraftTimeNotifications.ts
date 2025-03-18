"use server"

import { Resend } from "resend"
import { DraftTimeEmailTemplate } from "@/components/emails/DraftTimeEmailTemplate"
import { createClient } from "@/libs/supabase/server"
import { format } from "date-fns"
import type { LeagueMember } from "@/types/database"

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY)

/** Send email with delay to avoid rate limiting */
async function sendEmailWithDelay(
  member: LeagueMember,
  delay: number,
  league: any,
  formattedDate: string,
  formattedTime: string,
  isUpdate: boolean,
  leagueId: string,
) {
  return new Promise((resolve) => setTimeout(resolve, delay)).then(async () => {
    if (!member.users?.email) return null

    console.log(`📨 Sending email to: ${member.users.email}`)

    try {
      const response = await resend.emails.send({
        from: "Dryft <no-reply@dryftplay.com>",
        to: [member.users.email],
        subject: isUpdate ? `Draft Time Updated for ${league.name}` : `Draft Time Set for ${league.name}`,
        react: DraftTimeEmailTemplate({
          userName: member.users.display_name || member.team_name || "League Member",
          leagueName: league.name,
          draftDate: formattedDate,
          draftTime: formattedTime,
          isUpdate,
          leagueId,
        }),
      })

      console.log(`✅ Email successfully sent to ${member.users.email}:`, response)
      return response
    } catch (error) {
      console.error(`❌ Failed to send email to ${member.users.email}:`, error)
      return null
    }
  })
}

export async function sendDraftTimeNotification(
  leagueId: string,
  draftTime: Date,
  isUpdate: boolean,
  localHours: number,
  localMinutes: number,
) {
  try {
    const supabase = createClient()

    console.log(`📨 Sending Draft Time Notification for League: ${leagueId}`)
    console.log(`🕒 Draft Time (ISO): ${draftTime.toISOString()}`)
    console.log(`🕒 Local Hours: ${localHours}, Local Minutes: ${localMinutes}`)

    // Create a new date object with the same date
    const localDraftTime = new Date(draftTime)

    // Override with the local hours and minutes that were passed in
    localDraftTime.setHours(localHours, localMinutes, 0, 0)

    console.log(`🕒 Local Draft Time: ${localDraftTime.toString()}`)

    // Fetch league details
    const { data: league, error: leagueError } = await supabase
      .from("leagues")
      .select("id, name")
      .eq("id", leagueId)
      .single()

    if (leagueError || !league) {
      console.error("❌ League not found", leagueError)
      throw new Error("League not found")
    }

    console.log(`✅ League found: ${league.name}`)

    // Fetch league members with valid users
    const { data: members, error: membersError } = await supabase
      .from("league_members")
      .select(`
        id,
        team_name,
        users:users!inner (
          id,
          email,
          display_name
        )
      `)
      .eq("league_id", leagueId)
      .returns<LeagueMember[]>()

    if (membersError) {
      console.error("❌ Failed to fetch league members:", membersError)
      throw new Error("Failed to fetch league members")
    }

    console.log(`👥 Total Members Fetched: ${members.length}`)

    // Filter out members without an email
    const membersWithEmail = members.filter((member) => member.users?.email)
    console.log(`📧 Members with valid emails: ${membersWithEmail.length}`)

    if (membersWithEmail.length === 0) {
      console.warn("⚠️ No members with valid emails. Skipping email sending.")
      return { success: false, message: "No valid emails to send notifications." }
    }

    // Format draft time for display - use the local time with original hours/minutes
    const formattedDate = format(localDraftTime, "EEEE, MMMM d, yyyy")
    const formattedTime = format(localDraftTime, "h:mm a")

    console.log(`📅 Formatted Date: ${formattedDate}`)
    console.log(`🕒 Formatted Time: ${formattedTime}`)

    // Send emails with delay to avoid rate limiting
    const emailPromises = membersWithEmail.map((member, index) =>
      sendEmailWithDelay(member, index * 600, league, formattedDate, formattedTime, isUpdate, leagueId),
    )

    // Wait for all emails to be sent
    const results = await Promise.all(emailPromises)
    const successCount = results.filter(Boolean).length

    console.log(`🎉 Successfully sent ${successCount} of ${membersWithEmail.length} emails`)

    return {
      success: true,
      message: `Successfully sent ${successCount} of ${membersWithEmail.length} emails`,
    }
  } catch (error) {
    console.error("❌ Error sending draft time notification emails:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}


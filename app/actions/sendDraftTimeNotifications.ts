"use server"

import { Resend } from "resend";
import { DraftTimeEmailTemplate } from "@/components/emails/DraftTimeEmailTemplate";
import { createClient } from "@/libs/supabase/server";
import { format } from "date-fns";
import { LeagueMember } from "@/types/database";

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendDraftTimeNotification(leagueId: string, draftTime: Date, isUpdate: boolean) {
  try {
    const supabase = createClient();

    console.log(`📨 Sending Draft Time Notification for League: ${leagueId}`);

    // Fetch league details
    const { data: league, error: leagueError } = await supabase
      .from("leagues")
      .select("id, name")
      .eq("id", leagueId)
      .single();

    if (leagueError || !league) {
      console.error("❌ League not found", leagueError);
      throw new Error("League not found");
    }

    console.log(`✅ League found: ${league.name}`);

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
      .returns<LeagueMember[]>();

    if (membersError) {
      console.error("❌ Failed to fetch league members:", membersError);
      throw new Error("Failed to fetch league members");
    }

    console.log(`👥 Total Members Fetched: ${members.length}`);
    console.log("🔍 Member Details:", JSON.stringify(members, null, 2));

    // Filter out members without an email
    const membersWithEmail = members.filter((member) => member.users?.email);
    console.log(`📧 Members with valid emails: ${membersWithEmail.length}`);

    if (membersWithEmail.length === 0) {
      console.warn("⚠️ No members with valid emails. Skipping email sending.");
      return { success: false, message: "No valid emails to send notifications." };
    }

    // Format draft time for display
    const formattedDate = format(draftTime, "EEEE, MMMM d, yyyy");
    const formattedTime = format(draftTime, "h:mm a");

    // Function to send emails with delay to prevent rate limits
    async function sendEmailWithDelay(member: LeagueMember, delay: number) {
      return new Promise((resolve) => setTimeout(resolve, delay)).then(async () => {
        if (!member.users?.email) return null;

        console.log(`📨 Sending email to: ${member.users.email}`);

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
          });

          console.log(`✅ Email successfully sent to ${member.users.email}:`, response);
          return response;
        } catch (error) {
          console.error(`❌ Failed to send email to ${member.users.email}:`, error);
          return null;
        }
      });
    }

    // Send emails with 500ms delay between each
    const emailPromises = membersWithEmail.map((member, index) =>
      sendEmailWithDelay(member, index * 600)
    );

    // Wait for all emails to be sent
    const results = await Promise.all(emailPromises);
    const successCount = results.filter(Boolean).length;

    console.log(`🎉 Successfully sent ${successCount} of ${membersWithEmail.length} emails`);

    return {
      success: true,
      message: `Successfully sent ${successCount} of ${membersWithEmail.length} emails`,
    };
  } catch (error) {
    console.error("❌ Error sending draft time notification emails:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

import { sendEmail } from "@/libs/resend"
import { NextResponse } from "next/server"


export async function POST(request: Request) {
  try {
    const { name, email, inquiryType, message } = await request.json()

    // Validate input
    if (!name || !email || !inquiryType || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if SUPPORT_EMAIL is set
    const supportEmail = "tyler@dryftplay.com"
    if (!supportEmail) {
      console.error("SUPPORT_EMAIL environment variable is not set")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    // Prepare email content
    const subject = `[${inquiryType.toUpperCase()}] New Feedback from ${name}`
    const text = `
      Name: ${name}
      Email: ${email}
      Inquiry Type: ${inquiryType}
      Message: ${message}
    `
    const html = `
      <h1>New Feedback - ${inquiryType.toUpperCase()}</h1>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Inquiry Type:</strong> ${inquiryType}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `

    // Send email
    await sendEmail({
      to: supportEmail,
      subject,
      text,
      html,
      replyTo: email,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending feedback:", error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}


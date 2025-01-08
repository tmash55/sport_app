import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInviteEmail(to: string, inviteLink: string, leagueName: string) {
  const subject = `You've been invited to join ${leagueName} on March Madness Fantasy`;
  const html = `
    <h1>You've been invited to join ${leagueName} on March Madness Fantasy</h1>
    <p>Click the following link to accept the invitation:</p>
    <a href="${inviteLink}">${inviteLink}</a>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: 'March Madness Fantasy <onboarding@resend.dev>',
      to: [to],
      subject: subject,
      html: html,
    });

    if (error) {
      console.error('Error sending email:', error);
      throw error;
    }

    console.log('Email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

export async function sendVerificationEmail(to: string, verificationLink: string) {
  const subject = 'Verify your email for March Madness Fantasy';
  const html = `
    <h1>Verify your email for March Madness Fantasy</h1>
    <p>Please click the button below to verify your email address:</p>
    <a href="${verificationLink}" style="background-color: #4CAF50; border: none; color: white; padding: 15px 32px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer;">Verify Email</a>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: 'March Madness Fantasy <noreply@yourdomain.com>',
      to: [to],
      subject: subject,
      html: html,
    });

    if (error) {
      console.error('Error sending verification email:', error);
      throw error;
    }

    console.log('Verification email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
}

export async function sendPasswordResetEmail(to: string, resetLink: string) {
  const subject = 'Reset your password for March Madness Fantasy';
  const html = `
    <h1>Reset your password for March Madness Fantasy</h1>
    <p>You have requested to reset your password. Click the button below to proceed:</p>
    <a href="${resetLink}" style="background-color: #008CBA; border: none; color: white; padding: 15px 32px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer;">Reset Password</a>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: 'March Madness Fantasy <noreply@yourdomain.com>',
      to: [to],
      subject: subject,
      html: html,
    });

    if (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }

    console.log('Password reset email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
}


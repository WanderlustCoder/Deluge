/**
 * Email sending utility.
 * In development, logs emails to console.
 * In production, configure SMTP via environment variables.
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  // In development, just log
  if (process.env.NODE_ENV !== "production" || !process.env.SMTP_HOST) {
    console.log("=== EMAIL ===");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${html}`);
    console.log("=============");
    return { success: true, messageId: `dev-${Date.now()}` };
  }

  // Production: use nodemailer if available
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const nodemailer = require("nodemailer") as typeof import("nodemailer");
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const result = await transporter.sendMail({
      from: process.env.SMTP_FROM || "noreply@deluge.fund",
      to,
      subject,
      html,
    });

    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, messageId: null };
  }
}

export function verificationEmailHtml(name: string, verifyUrl: string) {
  return `
    <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
      <h2 style="color: #0D47A1;">Verify your email</h2>
      <p>Hi ${name},</p>
      <p>Welcome to Deluge! Please verify your email address by clicking the button below:</p>
      <a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background: #0D47A1; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Verify Email</a>
      <p style="color: #666; font-size: 14px; margin-top: 20px;">If you didn't create an account, you can safely ignore this email.</p>
    </div>
  `;
}

export function resetPasswordEmailHtml(name: string, resetUrl: string) {
  return `
    <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
      <h2 style="color: #0D47A1;">Reset your password</h2>
      <p>Hi ${name},</p>
      <p>We received a request to reset your password. Click the button below to set a new one:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #0D47A1; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
      <p style="color: #666; font-size: 14px; margin-top: 20px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
    </div>
  `;
}

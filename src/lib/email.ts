import { Resend } from "resend";

const APP_URL = process.env.APP_URL ?? "http://localhost:3000";
const EMAIL_FROM = process.env.EMAIL_FROM ?? "onboarding@resend.dev";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

async function sendMail(to: string, subject: string, body: string) {
  if (!resend) {
    console.log(`\n----- EMAIL (stub) -----\nTo: ${to}\nSubject: ${subject}\n\n${body}\n-------------------------\n`);
    return;
  }

  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject,
    text: body,
  });
  if (error) {
    console.error("Failed to send email via Resend:", error);
  }
}

export async function sendVerificationEmail(email: string, token: string) {
  const link = `${APP_URL}/verify-email?token=${token}`;
  await sendMail(
    email,
    "Verify your email",
    `Welcome to the Mental Health Counseling Platform. Verify your email by visiting:\n${link}`
  );
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const link = `${APP_URL}/reset-password?token=${token}`;
  await sendMail(
    email,
    "Reset your password",
    `Reset your password by visiting:\n${link}\n\nIf you did not request this, you can ignore this email.`
  );
}

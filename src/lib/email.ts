import nodemailer from "nodemailer";

const APP_URL = process.env.APP_URL ?? "http://localhost:3000";
const EMAIL_FROM = process.env.EMAIL_FROM ?? "no-reply@example.com";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;

const transporter = SMTP_HOST
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: SMTP_USER && SMTP_PASSWORD ? { user: SMTP_USER, pass: SMTP_PASSWORD } : undefined,
    })
  : null;

async function sendMail(to: string, subject: string, body: string) {
  if (!transporter) {
    console.log(`\n----- EMAIL (stub) -----\nTo: ${to}\nSubject: ${subject}\n\n${body}\n-------------------------\n`);
    return;
  }

  try {
    await transporter.sendMail({
      from: EMAIL_FROM,
      to,
      subject,
      text: body,
    });
  } catch (error) {
    console.error("Failed to send email via SMTP:", error);
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

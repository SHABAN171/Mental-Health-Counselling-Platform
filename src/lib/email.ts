const APP_URL = process.env.APP_URL ?? "http://localhost:3000";

async function sendMail(to: string, subject: string, body: string) {
  console.log(`\n----- EMAIL (stub) -----\nTo: ${to}\nSubject: ${subject}\n\n${body}\n-------------------------\n`);
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

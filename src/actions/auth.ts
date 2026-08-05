"use server";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { signIn, signOut } from "@/lib/auth";
import { roleHome } from "@/lib/rbac";
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/email";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validations/auth";

export type FormState =
  | {
      errors?: Record<string, string[]>;
      message?: string;
      unverifiedEmail?: string;
    }
  | undefined;

const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

export async function register(_state: FormState, formData: FormData): Promise<FormState> {
  const validated = registerSchema.safeParse(Object.fromEntries(formData));
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { fullName, email, password, phone, role, qualification, specialization, licenseNumber, experienceYears } =
    validated.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { errors: { email: ["An account with this email already exists."] } };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      passwordHash,
      phone: phone || null,
      role,
      ...(role === "COUNSELOR"
        ? {
            counselorProfile: {
              create: {
                qualification: qualification!,
                specialization: specialization!,
                licenseNumber: licenseNumber!,
                experienceYears: experienceYears ?? 0,
              },
            },
          }
        : {}),
    },
  });

  const token = crypto.randomBytes(32).toString("hex");
  await prisma.verificationToken.create({
    data: {
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS),
    },
  });
  await sendVerificationEmail(user.email, token);

  redirect("/login?registered=1");
}

export async function login(_state: FormState, formData: FormData): Promise<FormState> {
  const validated = loginSchema.safeParse(Object.fromEntries(formData));
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { email, password } = validated.data;

  const user = await prisma.user.findUnique({
    where: { email },
    include: { counselorProfile: true },
  });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { message: "Invalid email or password." };
  }

  if (!user.emailVerified) {
    return {
      message: "Please verify your email before logging in. Check your inbox for the verification link.",
      unverifiedEmail: user.email,
    };
  }

  if (user.role === "COUNSELOR" && user.counselorProfile?.status !== "APPROVED") {
    return { message: "Your counselor account is pending admin approval." };
  }

  await signIn("credentials", { email, password, redirect: false });
  redirect(roleHome(user.role));
}

export async function logout() {
  await signOut({ redirect: false });
  redirect("/login");
}

export async function requestPasswordReset(_state: FormState, formData: FormData): Promise<FormState> {
  const validated = forgotPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const user = await prisma.user.findUnique({ where: { email: validated.data.email } });
  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      },
    });
    await sendPasswordResetEmail(user.email, token);
  }

  return { message: "If an account with that email exists, a password reset link has been sent." };
}

export async function resetPassword(_state: FormState, formData: FormData): Promise<FormState> {
  const validated = resetPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { token, password } = validated.data;

  const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!resetToken || resetToken.expiresAt < new Date()) {
    return { message: "This reset link is invalid or has expired." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.$transaction([
    prisma.user.update({ where: { id: resetToken.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.delete({ where: { id: resetToken.id } }),
  ]);

  redirect("/login?reset=1");
}

export async function verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
  const verificationToken = await prisma.verificationToken.findUnique({ where: { token } });
  if (!verificationToken || verificationToken.expiresAt < new Date()) {
    return { success: false, message: "This verification link is invalid or has expired." };
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: verificationToken.userId }, data: { emailVerified: new Date() } }),
    prisma.verificationToken.delete({ where: { id: verificationToken.id } }),
  ]);

  return { success: true, message: "Your email has been verified. You can now log in." };
}

export async function resendVerificationEmail(_state: FormState, formData: FormData): Promise<FormState> {
  const validated = forgotPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!validated.success) {
    return { message: "Please enter a valid email." };
  }

  const user = await prisma.user.findUnique({ where: { email: validated.data.email } });
  if (user && !user.emailVerified) {
    await prisma.verificationToken.deleteMany({ where: { userId: user.id } });
    const token = crypto.randomBytes(32).toString("hex");
    await prisma.verificationToken.create({
      data: { userId: user.id, token, expiresAt: new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS) },
    });
    await sendVerificationEmail(user.email, token);
  }

  return { message: "If that account needs verifying, a new link has been sent to its inbox." };
}

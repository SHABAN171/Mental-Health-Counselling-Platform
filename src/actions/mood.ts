"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { logMoodSchema } from "@/lib/validations/mood";
import type { FormState } from "@/actions/auth";

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfTomorrow() {
  const d = startOfToday();
  d.setDate(d.getDate() + 1);
  return d;
}

export async function logMood(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requireRole("PATIENT");

  const validated = logMoodSchema.safeParse(Object.fromEntries(formData));
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { mood, note } = validated.data;

  const existing = await prisma.moodEntry.findFirst({
    where: { userId: user.id, date: { gte: startOfToday(), lt: startOfTomorrow() } },
  });

  if (existing) {
    await prisma.moodEntry.update({
      where: { id: existing.id },
      data: { mood, note: note || null },
    });
  } else {
    await prisma.moodEntry.create({
      data: { userId: user.id, mood, note: note || null },
    });
  }

  revalidatePath("/patient/mood");
  return { message: "Mood logged for today." };
}

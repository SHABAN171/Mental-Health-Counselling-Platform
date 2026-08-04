"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { availabilitySchema } from "@/lib/validations/appointments";
import type { FormState } from "@/actions/auth";

export async function addAvailability(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requireRole("COUNSELOR");

  const validated = availabilitySchema.safeParse(Object.fromEntries(formData));
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const profile = await prisma.counselorProfile.findUnique({ where: { userId: user.id } });
  if (!profile) return { message: "Counselor profile not found." };

  await prisma.availability.create({
    data: {
      counselorId: profile.id,
      dayOfWeek: validated.data.dayOfWeek,
      startTime: validated.data.startTime,
      endTime: validated.data.endTime,
    },
  });

  revalidatePath("/counselor/availability");
}

export async function deleteAvailability(availabilityId: string) {
  const user = await requireRole("COUNSELOR");

  const profile = await prisma.counselorProfile.findUnique({ where: { userId: user.id } });
  if (!profile) return;

  await prisma.availability.deleteMany({
    where: { id: availabilityId, counselorId: profile.id },
  });

  revalidatePath("/counselor/availability");
}

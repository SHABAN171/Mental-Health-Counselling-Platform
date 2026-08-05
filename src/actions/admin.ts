"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";

export async function approveCounselor(counselorProfileId: string) {
  await requireRole("ADMIN");

  await prisma.counselorProfile.update({
    where: { id: counselorProfileId },
    data: { approved: true },
  });

  revalidatePath("/admin/counselors");
  revalidatePath("/admin/dashboard");
}

export async function rejectCounselor(counselorProfileId: string) {
  await requireRole("ADMIN");

  const profile = await prisma.counselorProfile.findUnique({ where: { id: counselorProfileId } });
  if (profile) {
    await prisma.user.delete({ where: { id: profile.userId } });
  }

  revalidatePath("/admin/counselors");
  revalidatePath("/admin/dashboard");
}

export async function revokeCounselor(counselorProfileId: string) {
  await requireRole("ADMIN");

  await prisma.counselorProfile.update({
    where: { id: counselorProfileId },
    data: { approved: false },
  });

  revalidatePath("/admin/counselors");
  revalidatePath("/admin/dashboard");
}

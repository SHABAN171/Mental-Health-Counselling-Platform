"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { createNotification } from "@/lib/notifications";

function revalidateAdmin() {
  revalidatePath("/admin/counselors");
  revalidatePath("/admin/dashboard");
}

export async function approveCounselor(counselorProfileId: string) {
  await requireRole("ADMIN");

  const profile = await prisma.counselorProfile.update({
    where: { id: counselorProfileId },
    data: { status: "APPROVED" },
  });

  await createNotification(profile.userId, "Your counselor account has been approved. You can now accept appointments.");

  revalidateAdmin();
}

// Only ever deletes an account that has never been approved. A previously-approved
// counselor can only be moved to REVOKED (see revokeCounselor), never deleted here,
// so this button can't be used to silently destroy an established account.
export async function rejectCounselor(counselorProfileId: string) {
  await requireRole("ADMIN");

  const profile = await prisma.counselorProfile.findUnique({ where: { id: counselorProfileId } });
  if (profile && profile.status === "PENDING") {
    await prisma.user.delete({ where: { id: profile.userId } });
  }

  revalidateAdmin();
}

export async function revokeCounselor(counselorProfileId: string) {
  await requireRole("ADMIN");

  const profile = await prisma.counselorProfile.update({
    where: { id: counselorProfileId },
    data: { status: "REVOKED" },
  });

  await createNotification(profile.userId, "Your counselor approval has been revoked. Contact support for details.");

  revalidateAdmin();
}

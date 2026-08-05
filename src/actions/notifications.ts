"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/rbac";

function revalidateNotifications() {
  revalidatePath("/patient/notifications");
  revalidatePath("/counselor/notifications");
  revalidatePath("/admin/notifications");
}

export async function markNotificationRead(notificationId: string) {
  const user = await requireUser();

  await prisma.notification.updateMany({
    where: { id: notificationId, userId: user.id },
    data: { status: "READ" },
  });

  revalidateNotifications();
}

export async function markAllNotificationsRead() {
  const user = await requireUser();

  await prisma.notification.updateMany({
    where: { userId: user.id, status: "UNREAD" },
    data: { status: "READ" },
  });

  revalidateNotifications();
}

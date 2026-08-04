"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/rbac";
import { threadIdFor } from "@/lib/messages";
import { sendMessageSchema } from "@/lib/validations/messages";
import type { FormState } from "@/actions/auth";

const SAFE_BACK_TO = /^\/(patient|counselor)\/messages\/[a-zA-Z0-9_-]+$/;

export async function sendMessage(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();

  const validated = sendMessageSchema.safeParse(Object.fromEntries(formData));
  if (!validated.success) {
    return { message: "Message can't be empty." };
  }

  const { receiverId, content, backTo } = validated.data;
  const safeBackTo = SAFE_BACK_TO.test(backTo) ? backTo : "/";

  const relationship = await prisma.appointment.findFirst({
    where: {
      OR: [
        { patientId: user.id, counselorId: receiverId },
        { patientId: receiverId, counselorId: user.id },
      ],
    },
  });
  if (!relationship) {
    return { message: "You can only message a counselor or patient you have an appointment with." };
  }

  await prisma.message.create({
    data: {
      threadId: threadIdFor(user.id, receiverId),
      senderId: user.id,
      receiverId,
      content,
    },
  });

  redirect(safeBackTo);
}

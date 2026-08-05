"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { sessionNoteSchema } from "@/lib/validations/session-notes";
import { createNotification } from "@/lib/notifications";
import type { FormState } from "@/actions/auth";

export async function saveSessionNote(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requireRole("COUNSELOR");

  const validated = sessionNoteSchema.safeParse(Object.fromEntries(formData));
  if (!validated.success) {
    return { message: "Please check the form and try again." };
  }

  const { appointmentId, notes, recommendation, prescription } = validated.data;

  const appointment = await prisma.appointment.findFirst({
    where: { id: appointmentId, counselorId: user.id, status: { in: ["CONFIRMED", "COMPLETED"] } },
  });
  if (!appointment) {
    return { message: "Appointment not found." };
  }

  await prisma.sessionNote.upsert({
    where: { appointmentId },
    create: {
      appointmentId,
      notes: notes || null,
      recommendation: recommendation || null,
      prescription: prescription || null,
    },
    update: {
      notes: notes || null,
      recommendation: recommendation || null,
      prescription: prescription || null,
    },
  });

  if (recommendation || prescription) {
    await createNotification(
      appointment.patientId,
      `${user.name} shared a recommendation from your appointment on ${appointment.date.toLocaleDateString()}.`
    );
  }

  redirect("/counselor/appointments?noteSaved=1");
}

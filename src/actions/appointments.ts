"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { bookAppointmentSchema } from "@/lib/validations/appointments";
import { createNotification } from "@/lib/notifications";
import type { FormState } from "@/actions/auth";

export async function bookAppointment(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requireRole("PATIENT");

  const validated = bookAppointmentSchema.safeParse(Object.fromEntries(formData));
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { counselorId, date, dayOfWeek, startTime, endTime } = validated.data;

  const counselorUser = await prisma.user.findUnique({
    where: { id: counselorId },
    include: { counselorProfile: true },
  });

  if (!counselorUser || counselorUser.role !== "COUNSELOR" || counselorUser.counselorProfile?.status !== "APPROVED") {
    return { message: "This counselor is not available for booking." };
  }

  const availability = await prisma.availability.findFirst({
    where: { counselorId: counselorUser.counselorProfile.id, dayOfWeek, startTime, endTime },
  });
  if (!availability) {
    return { message: "That slot is no longer available." };
  }

  const conflict = await prisma.appointment.findFirst({
    where: {
      counselorId: counselorUser.id,
      date: new Date(date),
      startTime,
      status: { not: "CANCELLED" },
    },
  });
  if (conflict) {
    return { message: "That slot has already been booked. Please pick another." };
  }

  await prisma.appointment.create({
    data: {
      patientId: user.id,
      counselorId: counselorUser.id,
      date: new Date(date),
      startTime,
      endTime,
      status: "PENDING",
    },
  });

  await createNotification(
    counselorUser.id,
    `${user.name} requested an appointment on ${new Date(date).toLocaleDateString()} at ${startTime}.`
  );

  redirect("/patient/appointments?booked=1");
}

const STATUS_LABEL: Record<"CONFIRMED" | "CANCELLED" | "COMPLETED", string> = {
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  COMPLETED: "marked as completed",
};

export async function updateAppointmentStatus(
  appointmentId: string,
  status: "CONFIRMED" | "CANCELLED" | "COMPLETED"
) {
  const user = await requireRole("COUNSELOR");

  const appointment = await prisma.appointment.findFirst({
    where: { id: appointmentId, counselorId: user.id },
  });
  if (!appointment) return;

  await prisma.appointment.update({ where: { id: appointmentId }, data: { status } });

  await createNotification(
    appointment.patientId,
    `Your appointment on ${appointment.date.toLocaleDateString()} was ${STATUS_LABEL[status]}.`
  );

  revalidatePath("/counselor/appointments");
  revalidatePath("/patient/appointments");
}

export async function setMeetingLink(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requireRole("COUNSELOR");

  const appointmentId = String(formData.get("appointmentId") ?? "");
  const meetingLink = String(formData.get("meetingLink") ?? "").trim();

  if (!appointmentId) return { message: "Missing appointment." };
  if (meetingLink && !/^https?:\/\//.test(meetingLink)) {
    return { message: "Meeting link must be a valid URL starting with http:// or https://." };
  }

  await prisma.appointment.updateMany({
    where: { id: appointmentId, counselorId: user.id },
    data: { meetingLink: meetingLink || null },
  });

  revalidatePath("/counselor/appointments");
}

export async function cancelAppointmentAsPatient(appointmentId: string) {
  const user = await requireRole("PATIENT");

  const appointment = await prisma.appointment.findFirst({
    where: { id: appointmentId, patientId: user.id, status: { in: ["PENDING", "CONFIRMED"] } },
  });
  if (!appointment) return;

  await prisma.appointment.update({ where: { id: appointmentId }, data: { status: "CANCELLED" } });

  await createNotification(
    appointment.counselorId,
    `${user.name} cancelled their appointment on ${appointment.date.toLocaleDateString()}.`
  );

  revalidatePath("/patient/appointments");
  revalidatePath("/counselor/appointments");
}

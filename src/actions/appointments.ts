"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { bookAppointmentSchema } from "@/lib/validations/appointments";
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

  if (!counselorUser || counselorUser.role !== "COUNSELOR" || !counselorUser.counselorProfile?.approved) {
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

  redirect("/patient/appointments?booked=1");
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: "CONFIRMED" | "CANCELLED" | "COMPLETED"
) {
  const user = await requireRole("COUNSELOR");

  await prisma.appointment.updateMany({
    where: { id: appointmentId, counselorId: user.id },
    data: { status },
  });

  revalidatePath("/counselor/appointments");
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

  await prisma.appointment.updateMany({
    where: {
      id: appointmentId,
      patientId: user.id,
      status: { in: ["PENDING", "CONFIRMED"] },
    },
    data: { status: "CANCELLED" },
  });

  revalidatePath("/patient/appointments");
}

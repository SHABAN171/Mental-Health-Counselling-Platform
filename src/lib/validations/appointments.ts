import { z } from "zod";

const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:MM format.");

export const availabilitySchema = z
  .object({
    dayOfWeek: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]),
    startTime: timeSchema,
    endTime: timeSchema,
  })
  .refine((data) => data.startTime < data.endTime, {
    error: "Start time must be before end time.",
    path: ["endTime"],
  });

export const bookAppointmentSchema = z
  .object({
    counselorId: z.string().min(1),
    date: z.iso.date("Pick a valid date."),
    dayOfWeek: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]),
    startTime: timeSchema,
    endTime: timeSchema,
  })
  .refine((data) => new Date(data.date) >= new Date(new Date().toDateString()), {
    error: "Date must be today or in the future.",
    path: ["date"],
  });

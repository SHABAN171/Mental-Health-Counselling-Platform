import { z } from "zod";

export const sessionNoteSchema = z.object({
  appointmentId: z.string().min(1),
  notes: z.string().trim().max(4000).optional().or(z.literal("")),
  recommendation: z.string().trim().max(2000).optional().or(z.literal("")),
  prescription: z.string().trim().max(2000).optional().or(z.literal("")),
});

import { z } from "zod";

export const logMoodSchema = z.object({
  mood: z.enum(["HAPPY", "NORMAL", "SAD", "ANGRY", "ANXIOUS"]),
  note: z.string().trim().max(500).optional().or(z.literal("")),
});

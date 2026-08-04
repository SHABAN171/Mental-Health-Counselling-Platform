import { z } from "zod";

export const submitAssessmentSchema = z.object({
  type: z.enum(["DEPRESSION", "ANXIETY", "STRESS"]),
  answers: z.string().transform((val, ctx) => {
    try {
      const parsed = JSON.parse(val);
      if (!Array.isArray(parsed) || !parsed.every((n) => typeof n === "number")) {
        throw new Error("not an array of numbers");
      }
      return parsed as number[];
    } catch {
      ctx.addIssue({ code: "custom", message: "Invalid answers." });
      return z.NEVER;
    }
  }),
});

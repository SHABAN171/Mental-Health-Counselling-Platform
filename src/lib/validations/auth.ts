import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long.")
  .regex(/[a-zA-Z]/, "Password must contain at least one letter.")
  .regex(/[0-9]/, "Password must contain at least one number.");

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, "Name must be at least 2 characters long."),
    email: z.email("Please enter a valid email.").trim(),
    password: passwordSchema,
    confirmPassword: z.string(),
    phone: z.string().trim().optional().or(z.literal("")),
    role: z.enum(["PATIENT", "COUNSELOR"]),
    qualification: z.string().trim().optional(),
    specialization: z.string().trim().optional(),
    licenseNumber: z.string().trim().optional(),
    experienceYears: z.coerce.number().int().min(0).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Passwords do not match.",
    path: ["confirmPassword"],
  })
  .refine(
    (data) =>
      data.role !== "COUNSELOR" ||
      (data.qualification && data.specialization && data.licenseNumber),
    {
      error: "Qualification, specialization, and license number are required for counselors.",
      path: ["qualification"],
    }
  );

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.email("Please enter a valid email.").trim(),
  password: z.string().min(1, "Password is required."),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.email("Please enter a valid email.").trim(),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Passwords do not match.",
    path: ["confirmPassword"],
  });

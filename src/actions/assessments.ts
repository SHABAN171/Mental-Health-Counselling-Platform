"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { QUESTIONNAIRES } from "@/lib/assessments/questionnaires";
import { submitAssessmentSchema } from "@/lib/validations/assessments";
import type { FormState } from "@/actions/auth";

export async function submitAssessment(_state: FormState, formData: FormData): Promise<FormState> {
  const user = await requireRole("PATIENT");

  const validated = submitAssessmentSchema.safeParse(Object.fromEntries(formData));
  if (!validated.success) {
    return { message: "Something went wrong submitting your assessment. Please try again." };
  }

  const { type, answers } = validated.data;
  const questionnaire = QUESTIONNAIRES[type];

  if (
    answers.length !== questionnaire.questions.length ||
    answers.some((a) => !Number.isInteger(a) || a < 0 || a > 3)
  ) {
    return { message: "Please answer every question before submitting." };
  }

  const score = answers.reduce((sum, a) => sum + a, 0);
  const riskLevel = questionnaire.scoreToRisk(score);

  const assessment = await prisma.assessment.create({
    data: { userId: user.id, type, answers, score, riskLevel },
  });

  redirect(`/patient/assessments/result/${assessment.id}`);
}

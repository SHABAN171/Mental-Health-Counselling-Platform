"use client";

import { useActionState, useState } from "react";
import { submitAssessment } from "@/actions/assessments";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { AssessmentType } from "@/generated/prisma/enums";

type AssessmentFormProps = {
  type: AssessmentType;
  questions: string[];
  options: { value: number; label: string }[];
};

export function AssessmentForm({ type, questions, options }: AssessmentFormProps) {
  const [state, action, pending] = useActionState(submitAssessment, undefined);
  const [answers, setAnswers] = useState<(number | null)[]>(questions.map(() => null));

  const allAnswered = answers.every((a) => a !== null);

  return (
    <form action={action} className="flex flex-col gap-6">
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="answers" value={JSON.stringify(answers)} />

      {questions.map((question, index) => (
        <div key={index} className="flex flex-col gap-2 border-b pb-4 last:border-b-0">
          <p className="text-sm font-medium">
            {index + 1}. {question}
          </p>
          <div className="flex flex-wrap gap-2">
            {options.map((option) => (
              <Button
                key={option.value}
                type="button"
                size="sm"
                variant={answers[index] === option.value ? "default" : "outline"}
                onClick={() =>
                  setAnswers((prev) => prev.map((a, i) => (i === index ? option.value : a)))
                }
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      ))}

      {state?.message && (
        <Alert variant="destructive">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={!allAnswered || pending} className="w-fit">
        {pending ? "Submitting..." : "Submit"}
      </Button>
    </form>
  );
}

import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QUESTIONNAIRES } from "@/lib/assessments/questionnaires";
import { AssessmentForm } from "./assessment-form";

export default async function TakeAssessmentPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const questionnaire = QUESTIONNAIRES[type as keyof typeof QUESTIONNAIRES];
  if (!questionnaire) notFound();

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{questionnaire.title}</CardTitle>
        <CardDescription>{questionnaire.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <AssessmentForm type={questionnaire.type} questions={questionnaire.questions} options={questionnaire.options} />
      </CardContent>
    </Card>
  );
}

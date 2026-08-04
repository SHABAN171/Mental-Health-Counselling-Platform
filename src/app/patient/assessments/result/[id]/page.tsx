import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { QUESTIONNAIRES, RISK_LEVEL_LABELS, RISK_LEVEL_RECOMMENDATIONS } from "@/lib/assessments/questionnaires";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default async function AssessmentResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireRole("PATIENT");

  const assessment = await prisma.assessment.findUnique({ where: { id } });
  if (!assessment || assessment.userId !== user.id) notFound();

  const questionnaire = QUESTIONNAIRES[assessment.type];
  const answers = assessment.answers as number[];
  const selfHarmFlag = assessment.type === "DEPRESSION" && (answers[8] ?? 0) > 0;

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      {selfHarmFlag && (
        <Alert variant="destructive">
          <AlertTitle>You&apos;re not alone</AlertTitle>
          <AlertDescription>
            You indicated having thoughts of self-harm. If you are in immediate danger, contact your local emergency
            number now. In the US, you can call or text 988 (Suicide & Crisis Lifeline) at any time. Please also
            consider booking a session with a counselor as soon as possible.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{questionnaire.title} result</CardTitle>
          <CardDescription>Taken on {assessment.dateTaken.toLocaleDateString()}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <p className="text-3xl font-semibold">
              {assessment.score} / {questionnaire.maxScore}
            </p>
            <p className="text-sm text-muted-foreground">Risk level: {RISK_LEVEL_LABELS[assessment.riskLevel]}</p>
          </div>
          <p className="text-sm">{RISK_LEVEL_RECOMMENDATIONS[assessment.riskLevel]}</p>
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button render={<Link href="/patient/book">Book a counselor</Link>} nativeButton={false} />
          <Button
            variant="outline"
            render={<Link href="/patient/assessments">Back to assessments</Link>}
            nativeButton={false}
          />
        </CardFooter>
      </Card>
    </div>
  );
}

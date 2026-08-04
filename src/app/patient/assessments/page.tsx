import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { QUESTIONNAIRES, RISK_LEVEL_LABELS } from "@/lib/assessments/questionnaires";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function AssessmentsPage() {
  const user = await requireRole("PATIENT");

  const history = await prisma.assessment.findMany({
    where: { userId: user.id },
    orderBy: { dateTaken: "desc" },
    take: 10,
  });

  return (
    <div className="flex flex-col gap-6">
      <Alert>
        <AlertDescription>
          These screenings are self-assessment tools, not a diagnosis. They can&apos;t replace an evaluation by a
          licensed mental health professional.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 sm:grid-cols-3">
        {Object.values(QUESTIONNAIRES).map((q) => (
          <Card key={q.type}>
            <CardHeader>
              <CardTitle>{q.title}</CardTitle>
              <CardDescription>{q.questions.length} questions · ~3 minutes</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button render={<Link href={`/patient/assessments/${q.type}`}>Start</Link>} nativeButton={false} />
            </CardFooter>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No assessments taken yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Risk level</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{QUESTIONNAIRES[entry.type].title}</TableCell>
                    <TableCell>{entry.dateTaken.toLocaleDateString()}</TableCell>
                    <TableCell>
                      {entry.score} / {QUESTIONNAIRES[entry.type].maxScore}
                    </TableCell>
                    <TableCell>{RISK_LEVEL_LABELS[entry.riskLevel]}</TableCell>
                    <TableCell>
                      <Link
                        href={`/patient/assessments/result/${entry.id}`}
                        className="text-sm underline underline-offset-4"
                      >
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function PatientSessionNotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireRole("PATIENT");

  const appointment = await prisma.appointment.findFirst({
    where: { id, patientId: user.id },
    include: { counselor: true, sessionNote: true },
  });
  if (!appointment || !(appointment.sessionNote?.recommendation || appointment.sessionNote?.prescription)) {
    notFound();
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Notes from {appointment.counselor.fullName}</CardTitle>
        <CardDescription>
          {appointment.date.toLocaleDateString()} · {appointment.startTime}–{appointment.endTime}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {appointment.sessionNote?.recommendation && (
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-medium">Recommendation</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {appointment.sessionNote.recommendation}
            </p>
          </div>
        )}
        {appointment.sessionNote?.prescription && (
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-medium">Prescription</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {appointment.sessionNote.prescription}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

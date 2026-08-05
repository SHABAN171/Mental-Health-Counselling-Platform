import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SessionNoteForm } from "./session-note-form";

export default async function SessionNotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireRole("COUNSELOR");

  const appointment = await prisma.appointment.findFirst({
    where: { id, counselorId: user.id, status: { in: ["CONFIRMED", "COMPLETED"] } },
    include: { patient: true, sessionNote: true },
  });
  if (!appointment) notFound();

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Session note — {appointment.patient.fullName}</CardTitle>
        <CardDescription>
          {appointment.date.toLocaleDateString()} · {appointment.startTime}–{appointment.endTime}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SessionNoteForm
          appointmentId={appointment.id}
          notes={appointment.sessionNote?.notes ?? ""}
          recommendation={appointment.sessionNote?.recommendation ?? ""}
          prescription={appointment.sessionNote?.prescription ?? ""}
        />
      </CardContent>
    </Card>
  );
}

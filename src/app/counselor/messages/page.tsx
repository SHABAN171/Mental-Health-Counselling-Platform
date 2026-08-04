import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function CounselorMessagesPage() {
  const user = await requireRole("COUNSELOR");

  const appointments = await prisma.appointment.findMany({
    where: { counselorId: user.id },
    distinct: ["patientId"],
    include: { patient: true },
    orderBy: { date: "desc" },
  });

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Messages</CardTitle>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            You can message a patient once you have an appointment with them.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {appointments.map((appt) => (
              <li key={appt.patientId}>
                <Link
                  href={`/counselor/messages/${appt.patientId}`}
                  className="block rounded-md border p-3 text-sm hover:bg-muted/50"
                >
                  {appt.patient.fullName}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

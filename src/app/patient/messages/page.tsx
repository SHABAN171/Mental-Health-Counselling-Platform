import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function PatientMessagesPage() {
  const user = await requireRole("PATIENT");

  const appointments = await prisma.appointment.findMany({
    where: { patientId: user.id },
    distinct: ["counselorId"],
    include: { counselor: true },
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
            You can message a counselor once you have an appointment with them.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {appointments.map((appt) => (
              <li key={appt.counselorId}>
                <Link
                  href={`/patient/messages/${appt.counselorId}`}
                  className="block rounded-md border p-3 text-sm hover:bg-muted/50"
                >
                  {appt.counselor.fullName}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

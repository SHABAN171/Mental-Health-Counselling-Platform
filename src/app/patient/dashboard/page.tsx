import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function PatientDashboardPage() {
  const user = await requireRole("PATIENT");

  const upcoming = await prisma.appointment.findMany({
    where: {
      patientId: user.id,
      status: { in: ["PENDING", "CONFIRMED"] },
      date: { gte: new Date(new Date().toDateString()) },
    },
    include: { counselor: true },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
    take: 5,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/patient/book">
          <Card className="h-full hover:bg-muted/50">
            <CardHeader>
              <CardTitle>Book a session</CardTitle>
              <CardDescription>Find a counselor and schedule a session.</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/patient/assessments">
          <Card className="h-full hover:bg-muted/50">
            <CardHeader>
              <CardTitle>Self-assessment</CardTitle>
              <CardDescription>Check in on your mental well-being.</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/patient/mood">
          <Card className="h-full hover:bg-muted/50">
            <CardHeader>
              <CardTitle>Mood tracker</CardTitle>
              <CardDescription>Log today's mood.</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No upcoming appointments.{" "}
              <Link href="/patient/book" className="underline underline-offset-4">
                Book one now
              </Link>
              .
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {upcoming.map((appt) => (
                <li key={appt.id} className="flex justify-between rounded-md border p-3 text-sm">
                  <span>{appt.counselor.fullName}</span>
                  <span>
                    {appt.date.toLocaleDateString()} · {appt.startTime} · {appt.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function CounselorDashboardPage() {
  const user = await requireRole("COUNSELOR");

  const [pendingCount, upcoming, profile] = await Promise.all([
    prisma.appointment.count({ where: { counselorId: user.id, status: "PENDING" } }),
    prisma.appointment.findMany({
      where: { counselorId: user.id, status: "CONFIRMED", date: { gte: new Date(new Date().toDateString()) } },
      include: { patient: true },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
      take: 5,
    }),
    prisma.counselorProfile.findUnique({ where: { userId: user.id } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Pending requests</CardDescription>
            <CardTitle className="text-2xl">{pendingCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Upcoming confirmed</CardDescription>
            <CardTitle className="text-2xl">{upcoming.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Account status</CardDescription>
            <CardTitle className="text-2xl">
              <Badge variant={profile?.approved ? "default" : "secondary"}>
                {profile?.approved ? "Approved" : "Pending approval"}
              </Badge>
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing scheduled yet.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {upcoming.map((appt) => (
                <li key={appt.id} className="flex justify-between rounded-md border p-3 text-sm">
                  <span>{appt.patient.fullName}</span>
                  <span>
                    {appt.date.toLocaleDateString()} · {appt.startTime}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/counselor/appointments" className="mt-4 inline-block text-sm underline underline-offset-4">
            View all appointments
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

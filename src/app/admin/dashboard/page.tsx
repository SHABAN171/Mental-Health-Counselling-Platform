import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminDashboardPage() {
  await requireRole("ADMIN");

  const [patientCount, approvedCounselorCount, pendingCounselorCount, appointmentCount] = await Promise.all([
    prisma.user.count({ where: { role: "PATIENT" } }),
    prisma.counselorProfile.count({ where: { status: "APPROVED" } }),
    prisma.counselorProfile.count({ where: { status: "PENDING" } }),
    prisma.appointment.count(),
  ]);

  const stats = [
    { label: "Patients", value: patientCount },
    { label: "Approved counselors", value: approvedCounselorCount },
    { label: "Pending approvals", value: pendingCounselorCount },
    { label: "Appointments", value: appointmentCount },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardTitle className="text-sm font-normal text-muted-foreground">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {pendingCounselorCount > 0 && (
        <Card>
          <CardContent className="flex items-center justify-between py-4">
            <p className="text-sm">
              {pendingCounselorCount} counselor{pendingCounselorCount === 1 ? "" : "s"} waiting for approval.
            </p>
            <Link href="/admin/counselors" className="text-sm font-medium underline underline-offset-4">
              Review now
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

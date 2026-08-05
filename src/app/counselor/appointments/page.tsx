import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { updateAppointmentStatus } from "@/actions/appointments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MeetingLinkForm } from "./meeting-link-form";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "secondary",
  CONFIRMED: "default",
  CANCELLED: "destructive",
  COMPLETED: "outline",
};

export default async function CounselorAppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ noteSaved?: string }>;
}) {
  const { noteSaved } = await searchParams;
  const user = await requireRole("COUNSELOR");

  const appointments = await prisma.appointment.findMany({
    where: { counselorId: user.id },
    include: { patient: true },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });

  return (
    <div className="flex flex-col gap-4">
      {noteSaved && (
        <Alert>
          <AlertDescription>Session note saved.</AlertDescription>
        </Alert>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Appointments</CardTitle>
        </CardHeader>
        <CardContent>
        {appointments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No appointments yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Meeting link</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((appt) => (
                <TableRow key={appt.id}>
                  <TableCell>{appt.patient.fullName}</TableCell>
                  <TableCell>{appt.date.toLocaleDateString()}</TableCell>
                  <TableCell>
                    {appt.startTime}–{appt.endTime}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[appt.status]}>{appt.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {appt.status === "CONFIRMED" ? (
                      <MeetingLinkForm appointmentId={appt.id} meetingLink={appt.meetingLink} />
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {appt.status === "PENDING" && (
                        <>
                          <form action={updateAppointmentStatus.bind(null, appt.id, "CONFIRMED")}>
                            <Button type="submit" size="sm">
                              Confirm
                            </Button>
                          </form>
                          <form action={updateAppointmentStatus.bind(null, appt.id, "CANCELLED")}>
                            <Button type="submit" size="sm" variant="ghost">
                              Decline
                            </Button>
                          </form>
                        </>
                      )}
                      {appt.status === "CONFIRMED" && (
                        <>
                          <form action={updateAppointmentStatus.bind(null, appt.id, "COMPLETED")}>
                            <Button type="submit" size="sm">
                              Mark completed
                            </Button>
                          </form>
                          <form action={updateAppointmentStatus.bind(null, appt.id, "CANCELLED")}>
                            <Button type="submit" size="sm" variant="ghost">
                              Cancel
                            </Button>
                          </form>
                        </>
                      )}
                      {(appt.status === "CONFIRMED" || appt.status === "COMPLETED") && (
                        <Button
                          size="sm"
                          variant="outline"
                          nativeButton={false}
                          render={<Link href={`/counselor/appointments/${appt.id}/notes`}>Notes</Link>}
                        />
                      )}
                    </div>
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

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { cancelAppointmentAsPatient } from "@/actions/appointments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "secondary",
  CONFIRMED: "default",
  CANCELLED: "destructive",
  COMPLETED: "outline",
};

export default async function PatientAppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ booked?: string }>;
}) {
  const { booked } = await searchParams;
  const user = await requireRole("PATIENT");

  const appointments = await prisma.appointment.findMany({
    where: { patientId: user.id },
    include: { counselor: true, sessionNote: true },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });

  return (
    <div className="flex flex-col gap-4">
      {booked && (
        <Alert>
          <AlertDescription>Appointment requested. The counselor will confirm it shortly.</AlertDescription>
        </Alert>
      )}
      <Card>
        <CardHeader>
          <CardTitle>My appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <p className="text-sm text-muted-foreground">You have no appointments yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Counselor</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Meeting link</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appt) => (
                  <TableRow key={appt.id}>
                    <TableCell>{appt.counselor.fullName}</TableCell>
                    <TableCell>{appt.date.toLocaleDateString()}</TableCell>
                    <TableCell>
                      {appt.startTime}–{appt.endTime}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[appt.status]}>{appt.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {appt.meetingLink ? (
                        <a
                          href={appt.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm underline underline-offset-4"
                        >
                          Join
                        </a>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {(appt.status === "PENDING" || appt.status === "CONFIRMED") && (
                          <form action={cancelAppointmentAsPatient.bind(null, appt.id)}>
                            <Button type="submit" size="sm" variant="ghost">
                              Cancel
                            </Button>
                          </form>
                        )}
                        {(appt.sessionNote?.recommendation || appt.sessionNote?.prescription) && (
                          <Button
                            size="sm"
                            variant="outline"
                            nativeButton={false}
                            render={<Link href={`/patient/appointments/${appt.id}/notes`}>View notes</Link>}
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

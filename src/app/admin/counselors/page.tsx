import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { approveCounselor, rejectCounselor, revokeCounselor } from "@/actions/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function AdminCounselorsPage() {
  await requireRole("ADMIN");

  const counselors = await prisma.counselorProfile.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  const pending = counselors.filter((c) => !c.approved);
  const approved = counselors.filter((c) => c.approved);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Pending approval</CardTitle>
        </CardHeader>
        <CardContent>
          {pending.length === 0 ? (
            <p className="text-sm text-muted-foreground">No counselors waiting for approval.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Qualification</TableHead>
                  <TableHead>License #</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pending.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.user.fullName}</TableCell>
                    <TableCell>{c.user.email}</TableCell>
                    <TableCell>{c.qualification}</TableCell>
                    <TableCell>{c.licenseNumber}</TableCell>
                    <TableCell>{c.experienceYears} yrs</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <form action={approveCounselor.bind(null, c.id)}>
                          <Button type="submit" size="sm">
                            Approve
                          </Button>
                        </form>
                        <form action={rejectCounselor.bind(null, c.id)}>
                          <Button type="submit" size="sm" variant="destructive">
                            Reject
                          </Button>
                        </form>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Approved counselors</CardTitle>
        </CardHeader>
        <CardContent>
          {approved.length === 0 ? (
            <p className="text-sm text-muted-foreground">No approved counselors yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approved.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.user.fullName}</TableCell>
                    <TableCell>{c.user.email}</TableCell>
                    <TableCell>{c.specialization}</TableCell>
                    <TableCell>
                      <Badge>Approved</Badge>
                    </TableCell>
                    <TableCell>
                      <form action={revokeCounselor.bind(null, c.id)}>
                        <Button type="submit" size="sm" variant="ghost">
                          Revoke
                        </Button>
                      </form>
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

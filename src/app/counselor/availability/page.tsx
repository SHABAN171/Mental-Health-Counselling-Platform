import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { deleteAvailability } from "@/actions/availability";
import { DAY_OF_WEEK_LABELS } from "@/lib/date";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AvailabilityForm } from "./availability-form";

const DAY_ORDER = Object.keys(DAY_OF_WEEK_LABELS);

export default async function AvailabilityPage() {
  const user = await requireRole("COUNSELOR");
  const profile = await prisma.counselorProfile.findUnique({
    where: { userId: user.id },
    include: { availabilities: true },
  });

  const availabilities = (profile?.availabilities ?? []).sort(
    (a, b) => DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek) || a.startTime.localeCompare(b.startTime)
  );

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Weekly availability</CardTitle>
          <CardDescription>Add recurring weekly time slots patients can book.</CardDescription>
        </CardHeader>
        <CardContent>
          <AvailabilityForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your slots</CardTitle>
        </CardHeader>
        <CardContent>
          {availabilities.length === 0 ? (
            <p className="text-sm text-muted-foreground">No availability added yet.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {availabilities.map((slot) => (
                <li key={slot.id} className="flex items-center justify-between rounded-md border p-3">
                  <span>
                    {DAY_OF_WEEK_LABELS[slot.dayOfWeek]} · {slot.startTime}–{slot.endTime}
                  </span>
                  <form action={deleteAvailability.bind(null, slot.id)}>
                    <Button type="submit" variant="ghost" size="sm">
                      Remove
                    </Button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useActionState, useMemo, useState } from "react";
import { bookAppointment } from "@/actions/appointments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DAY_OF_WEEK_LABELS, dayOfWeekFromDateString } from "@/lib/date";
import type { DayOfWeek } from "@/generated/prisma/enums";

type Slot = { id: string; dayOfWeek: DayOfWeek; startTime: string; endTime: string };

function tomorrowISODate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export function BookingForm({ counselorId, availabilities }: { counselorId: string; availabilities: Slot[] }) {
  const [state, action, pending] = useActionState(bookAppointment, undefined);
  const [date, setDate] = useState(tomorrowISODate());
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  const dayOfWeek = date ? dayOfWeekFromDateString(date) : null;
  const matchingSlots = useMemo(
    () => (dayOfWeek ? availabilities.filter((slot) => slot.dayOfWeek === dayOfWeek) : []),
    [availabilities, dayOfWeek]
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="counselorId" value={counselorId} />
      {dayOfWeek && <input type="hidden" name="dayOfWeek" value={dayOfWeek} />}
      {selectedSlot && (
        <>
          <input type="hidden" name="startTime" value={selectedSlot.startTime} />
          <input type="hidden" name="endTime" value={selectedSlot.endTime} />
        </>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          name="date"
          type="date"
          min={tomorrowISODate()}
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            setSelectedSlot(null);
          }}
          required
        />
        {dayOfWeek && <p className="text-sm text-muted-foreground">{DAY_OF_WEEK_LABELS[dayOfWeek]}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label>Available times</Label>
        {matchingSlots.length === 0 ? (
          <p className="text-sm text-muted-foreground">No slots available on this day. Try another date.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {matchingSlots.map((slot) => (
              <Button
                key={slot.id}
                type="button"
                variant={selectedSlot?.id === slot.id ? "default" : "outline"}
                onClick={() => setSelectedSlot(slot)}
              >
                {slot.startTime}–{slot.endTime}
              </Button>
            ))}
          </div>
        )}
      </div>

      {state?.message && (
        <Alert variant="destructive">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={pending || !selectedSlot} className="w-fit">
        {pending ? "Booking..." : "Confirm booking"}
      </Button>
    </form>
  );
}

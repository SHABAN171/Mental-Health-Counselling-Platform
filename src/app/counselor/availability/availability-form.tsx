"use client";

import { useActionState } from "react";
import { addAvailability } from "@/actions/availability";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DAY_OF_WEEK_LABELS } from "@/lib/date";

const DAYS = Object.keys(DAY_OF_WEEK_LABELS) as (keyof typeof DAY_OF_WEEK_LABELS)[];

export function AvailabilityForm() {
  const [state, action, pending] = useActionState(addAvailability, undefined);

  return (
    <form action={action} className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-2">
        <Label htmlFor="dayOfWeek">Day</Label>
        <Select name="dayOfWeek" defaultValue="MONDAY">
          <SelectTrigger id="dayOfWeek" className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DAYS.map((day) => (
              <SelectItem key={day} value={day}>
                {DAY_OF_WEEK_LABELS[day]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="startTime">Start</Label>
        <Input id="startTime" name="startTime" type="time" required className="w-32" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="endTime">End</Label>
        <Input id="endTime" name="endTime" type="time" required className="w-32" />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Adding..." : "Add slot"}
      </Button>
      {state?.message && (
        <Alert variant="destructive" className="w-full">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}
      {state?.errors?.endTime && <p className="w-full text-sm text-destructive">{state.errors.endTime[0]}</p>}
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { setMeetingLink } from "@/actions/appointments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function MeetingLinkForm({ appointmentId, meetingLink }: { appointmentId: string; meetingLink: string | null }) {
  const [state, action, pending] = useActionState(setMeetingLink, undefined);

  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="appointmentId" value={appointmentId} />
      <Input
        key={meetingLink ?? ""}
        name="meetingLink"
        placeholder="https://meet.google.com/..."
        defaultValue={meetingLink ?? ""}
        className="h-8 w-56"
      />
      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        Save
      </Button>
      {state?.message && <span className="text-xs text-destructive">{state.message}</span>}
    </form>
  );
}

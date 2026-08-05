"use client";

import { useActionState } from "react";
import { saveSessionNote } from "@/actions/session-notes";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function SessionNoteForm({
  appointmentId,
  notes,
  recommendation,
  prescription,
}: {
  appointmentId: string;
  notes: string;
  recommendation: string;
  prescription: string;
}) {
  const [state, action, pending] = useActionState(saveSessionNote, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="appointmentId" value={appointmentId} />
      {state?.message && (
        <Alert variant="destructive">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="notes">Session notes</Label>
        <Textarea id="notes" name="notes" rows={6} defaultValue={notes} placeholder="Private notes from the session..." />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="recommendation">Recommendation</Label>
        <Textarea
          id="recommendation"
          name="recommendation"
          rows={3}
          defaultValue={recommendation}
          placeholder="Recommended next steps..."
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="prescription">Prescription</Label>
        <Textarea
          id="prescription"
          name="prescription"
          rows={3}
          defaultValue={prescription}
          placeholder="Any prescribed medication or exercises..."
        />
      </div>

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Saving..." : "Save note"}
      </Button>
    </form>
  );
}

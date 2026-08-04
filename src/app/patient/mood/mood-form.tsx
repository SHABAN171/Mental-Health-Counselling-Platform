"use client";

import { useActionState, useState } from "react";
import { logMood } from "@/actions/mood";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MOOD_OPTIONS } from "@/lib/mood";
import type { Mood } from "@/generated/prisma/enums";

export function MoodForm({ todaysMood }: { todaysMood: Mood | null }) {
  const [state, action, pending] = useActionState(logMood, undefined);
  const [selected, setSelected] = useState<Mood | null>(todaysMood);

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="mood" value={selected ?? ""} />
      <div className="flex flex-wrap gap-3">
        {MOOD_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setSelected(option.value)}
            className={`flex flex-col items-center gap-1 rounded-lg border p-3 text-sm transition-colors ${
              selected === option.value ? "border-primary bg-muted" : "border-border hover:bg-muted/50"
            }`}
          >
            <span className="text-2xl">{option.emoji}</span>
            {option.label}
          </button>
        ))}
      </div>
      <Textarea name="note" placeholder="Anything on your mind today? (optional)" rows={3} />
      {state?.message && (
        <Alert>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}
      <Button type="submit" disabled={!selected || pending} className="w-fit">
        {pending ? "Saving..." : "Save today's mood"}
      </Button>
    </form>
  );
}

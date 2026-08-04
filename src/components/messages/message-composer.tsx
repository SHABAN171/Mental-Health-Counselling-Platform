"use client";

import { useActionState, useRef } from "react";
import { sendMessage } from "@/actions/messages";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function MessageComposer({ receiverId, backTo }: { receiverId: string; backTo: string }) {
  const [state, action, pending] = useActionState(sendMessage, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-2">
      <input type="hidden" name="receiverId" value={receiverId} />
      <input type="hidden" name="backTo" value={backTo} />
      {state?.message && (
        <Alert variant="destructive">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}
      <div className="flex gap-2">
        <Textarea name="content" placeholder="Write a message..." rows={2} required className="resize-none" />
        <Button type="submit" disabled={pending} className="self-end">
          {pending ? "Sending..." : "Send"}
        </Button>
      </div>
    </form>
  );
}

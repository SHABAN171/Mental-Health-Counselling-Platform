import { prisma } from "@/lib/prisma";
import { threadIdFor } from "@/lib/messages";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageComposer } from "./message-composer";

export async function Thread({
  currentUserId,
  partnerId,
  partnerName,
  backTo,
}: {
  currentUserId: string;
  partnerId: string;
  partnerName: string;
  backTo: string;
}) {
  const threadId = threadIdFor(currentUserId, partnerId);

  const messages = await prisma.message.findMany({
    where: { threadId },
    orderBy: { createdAt: "asc" },
  });

  await prisma.message.updateMany({
    where: { threadId, receiverId: currentUserId, readAt: null },
    data: { readAt: new Date() },
  });

  return (
    <Card className="flex max-w-2xl flex-col">
      <CardHeader>
        <CardTitle>{partnerName}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex max-h-96 flex-col gap-3 overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-sm text-muted-foreground">No messages yet. Say hello.</p>
          ) : (
            messages.map((message) => {
              const isMine = message.senderId === currentUserId;
              return (
                <div
                  key={message.id}
                  className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                    isMine ? "self-end bg-primary text-primary-foreground" : "self-start bg-muted"
                  }`}
                >
                  <p>{message.content}</p>
                  <p className={`mt-1 text-xs ${isMine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {message.createdAt.toLocaleString()}
                  </p>
                </div>
              );
            })
          )}
        </div>
        <MessageComposer receiverId={partnerId} backTo={backTo} />
      </CardContent>
    </Card>
  );
}

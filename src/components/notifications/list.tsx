import { prisma } from "@/lib/prisma";
import { markNotificationRead, markAllNotificationsRead } from "@/actions/notifications";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export async function NotificationsList({ userId }: { userId: string }) {
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  const unreadCount = notifications.filter((n) => n.status === "UNREAD").length;

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        {unreadCount > 0 && (
          <CardAction>
            <form action={markAllNotificationsRead}>
              <Button type="submit" size="sm" variant="outline">
                Mark all as read
              </Button>
            </form>
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <p className="text-sm text-muted-foreground">No notifications yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className={`flex items-center justify-between gap-4 rounded-md border p-3 text-sm ${
                  notification.status === "UNREAD" ? "bg-accent/60" : ""
                }`}
              >
                <div className="flex flex-col gap-1">
                  <span>{notification.message}</span>
                  <span className="text-xs text-muted-foreground">
                    {notification.createdAt.toLocaleString()}
                  </span>
                </div>
                {notification.status === "UNREAD" && (
                  <form action={markNotificationRead.bind(null, notification.id)}>
                    <Button type="submit" size="sm" variant="ghost">
                      Mark read
                    </Button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

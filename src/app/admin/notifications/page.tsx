import { requireRole } from "@/lib/rbac";
import { NotificationsList } from "@/components/notifications/list";

export default async function AdminNotificationsPage() {
  const user = await requireRole("ADMIN");
  return <NotificationsList userId={user.id} />;
}

import { requireRole } from "@/lib/rbac";
import { NotificationsList } from "@/components/notifications/list";

export default async function CounselorNotificationsPage() {
  const user = await requireRole("COUNSELOR");
  return <NotificationsList userId={user.id} />;
}

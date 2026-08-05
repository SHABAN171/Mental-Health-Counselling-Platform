import { requireRole } from "@/lib/rbac";
import { NotificationsList } from "@/components/notifications/list";

export default async function PatientNotificationsPage() {
  const user = await requireRole("PATIENT");
  return <NotificationsList userId={user.id} />;
}

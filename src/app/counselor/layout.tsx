import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { DashboardNav } from "@/components/dashboard/nav";

export default async function CounselorLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("COUNSELOR");
  const unreadCount = await prisma.notification.count({ where: { userId: user.id, status: "UNREAD" } });

  const links = [
    { href: "/counselor/dashboard", label: "Dashboard" },
    { href: "/counselor/appointments", label: "Appointments" },
    { href: "/counselor/availability", label: "Availability" },
    { href: "/counselor/messages", label: "Messages" },
    { href: "/counselor/notifications", label: "Notifications", badge: unreadCount },
  ];

  return (
    <div className="flex min-h-svh flex-col">
      <DashboardNav title="Counselor" links={links} userName={user.name ?? user.email ?? ""} />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}

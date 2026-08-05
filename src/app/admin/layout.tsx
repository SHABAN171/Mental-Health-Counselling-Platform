import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { DashboardNav } from "@/components/dashboard/nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("ADMIN");
  const unreadCount = await prisma.notification.count({ where: { userId: user.id, status: "UNREAD" } });

  const links = [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/counselors", label: "Counselors" },
    { href: "/admin/notifications", label: "Notifications", badge: unreadCount },
  ];

  return (
    <div className="flex min-h-svh flex-col">
      <DashboardNav title="Admin" links={links} userName={user.name ?? user.email ?? ""} />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}

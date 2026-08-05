import { requireRole } from "@/lib/rbac";
import { DashboardNav } from "@/components/dashboard/nav";

const LINKS = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/counselors", label: "Counselors" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("ADMIN");

  return (
    <div className="flex min-h-svh flex-col">
      <DashboardNav title="Admin" links={LINKS} userName={user.name ?? user.email ?? ""} />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}

import { requireRole } from "@/lib/rbac";
import { DashboardNav } from "@/components/dashboard/nav";

const LINKS = [
  { href: "/counselor/dashboard", label: "Dashboard" },
  { href: "/counselor/appointments", label: "Appointments" },
  { href: "/counselor/availability", label: "Availability" },
];

export default async function CounselorLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("COUNSELOR");

  return (
    <div className="flex min-h-svh flex-col">
      <DashboardNav title="Counselor" links={LINKS} userName={user.name ?? user.email ?? ""} />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}

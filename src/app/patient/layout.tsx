import { requireRole } from "@/lib/rbac";
import { DashboardNav } from "@/components/dashboard/nav";

const LINKS = [
  { href: "/patient/dashboard", label: "Dashboard" },
  { href: "/patient/book", label: "Book Appointment" },
  { href: "/patient/appointments", label: "My Appointments" },
  { href: "/patient/assessments", label: "Assessments" },
  { href: "/patient/mood", label: "Mood Tracker" },
  { href: "/patient/messages", label: "Messages" },
];

export default async function PatientLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("PATIENT");

  return (
    <div className="flex min-h-svh flex-col">
      <DashboardNav title="Patient" links={LINKS} userName={user.name ?? user.email ?? ""} />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}

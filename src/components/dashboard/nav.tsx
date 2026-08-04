import Link from "next/link";
import { logout } from "@/actions/auth";
import { Button } from "@/components/ui/button";

export function DashboardNav({
  title,
  links,
  userName,
}: {
  title: string;
  links: { href: string; label: string }[];
  userName: string;
}) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b bg-background px-6 py-3">
      <div className="flex flex-wrap items-center gap-6">
        <Link href="/" className="font-semibold">
          MHCP
        </Link>
        <span className="text-sm text-muted-foreground">{title}</span>
        <nav className="flex gap-4">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm hover:underline">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">{userName}</span>
        <form action={logout}>
          <Button type="submit" variant="outline" size="sm">
            Log out
          </Button>
        </form>
      </div>
    </header>
  );
}

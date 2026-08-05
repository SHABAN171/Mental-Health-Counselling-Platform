import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession, roleHome } from "@/lib/rbac";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const session = await getSession();
  if (session?.user) redirect(roleHome(session.user.role));

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 bg-muted/40 p-6 text-center">
      <div className="flex flex-col items-center gap-4">
        <span className="text-lg font-semibold">MHCP</span>
        <h1 className="max-w-lg text-3xl font-semibold tracking-tight">
          Mental health support, made accessible
        </h1>
        <p className="max-w-md text-muted-foreground">
          Book appointments with qualified counselors, track your well-being, and message your
          care team, all in one secure place.
        </p>
      </div>
      <div className="flex gap-3">
        <Button nativeButton={false} render={<Link href="/register">Get started</Link>} />
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/login">Log in</Link>}
        />
      </div>
    </div>
  );
}

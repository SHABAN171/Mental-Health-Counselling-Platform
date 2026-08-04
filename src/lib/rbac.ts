import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import type { Role } from "@/generated/prisma/enums";

export const getSession = cache(async () => auth());

export function roleHome(role: Role) {
  switch (role) {
    case "ADMIN":
      return "/admin/dashboard";
    case "COUNSELOR":
      return "/counselor/dashboard";
    case "PATIENT":
    default:
      return "/patient/dashboard";
  }
}

export async function requireUser() {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  return session.user;
}

export async function requireRole(role: Role | Role[]) {
  const user = await requireUser();
  const roles = Array.isArray(role) ? role : [role];
  if (!roles.includes(user.role)) redirect(roleHome(user.role));
  return user;
}

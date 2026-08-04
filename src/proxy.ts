import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const ROLE_PREFIXES = {
  PATIENT: "/patient",
  COUNSELOR: "/counselor",
  ADMIN: "/admin",
} as const;

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const matchedRole = (Object.entries(ROLE_PREFIXES) as [keyof typeof ROLE_PREFIXES, string][]).find(
    ([, prefix]) => pathname.startsWith(prefix)
  )?.[0];

  if (!matchedRole) return NextResponse.next();

  if (!session?.user) {
    const loginUrl = new URL("/login", req.nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (session.user.role !== matchedRole) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/patient/:path*", "/counselor/:path*", "/admin/:path*"],
};

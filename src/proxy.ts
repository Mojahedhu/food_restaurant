import { NextRequest, NextResponse } from "next/server";
import { auth } from "../auth";
console.log("Middle work work");
export default async function proxy(req: NextRequest) {
  const session = await auth();
  console.log("session", session);
  const { nextUrl } = req;
  const isLoggedIn = !!session;

  // Path that require authentication
  const protectedPaths = ["/user", "/profile", "/orders", "/admin", "/cart"];
  const isProtectedPath = protectedPaths.some((path) =>
    nextUrl.pathname.startsWith(path),
  );

  const isAdminPath = nextUrl.pathname.startsWith("/admin");
  const isAdmin = session?.user?.role === "admin";

  const isAuthPath = nextUrl.pathname.startsWith("/auth");

  // Redirect to signin page if accessing protected path without authentication
  if (isProtectedPath && !isLoggedIn && !isAuthPath) {
    const url = new URL("/auth/signin", nextUrl.origin);
    url.searchParams.set("callbackUrl", nextUrl.pathname + nextUrl.search);
    return NextResponse.redirect(url);
  }

  // Redirect to home if accessing admin path without admin authentication
  if (isAdminPath && isLoggedIn && !isAdmin) {
    return NextResponse.redirect(new URL("/", nextUrl.origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

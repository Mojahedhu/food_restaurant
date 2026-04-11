import { NextResponse } from "next/server";
import auth from "./auth";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = req.auth;

  // Path that require authentication
  const protectedPaths = ["/user", "/profile", "/orders", "/admin"];
  const isProtectedPath = protectedPaths.some((path) =>
    nextUrl.pathname.startsWith(path),
  );

  const isAdminPath = nextUrl.pathname.startsWith("/admin");
  const isAdmin = req?.auth?.user?.role === "admin";

  // Redirect to signin page if accessing protected path without authentication
  if (isProtectedPath && !isLoggedIn) {
    const url = new URL("/auth/signin", nextUrl.origin);
    url.searchParams.set("callbackUrl", nextUrl.pathname);
    return Response.redirect(url);
  }

  // Redirect to home if accessing admin path without admin authentication
  if (isAdminPath && isLoggedIn && !isAdmin) {
    return NextResponse.redirect(new URL("/", nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

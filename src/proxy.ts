import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/../auth";
export default async function proxy(req: NextRequest) {
  const session = await auth();
  const { nextUrl } = req;
  const path = nextUrl.pathname;
  const res = NextResponse.next();

  const isLoggedIn = !!session;
  const isAdmin = session?.user?.role === "admin";

  // Path that require authentication
  const protectedPaths = [
    "/user",
    "/profile",
    "/orders",
    "/admin",
    "/checkout",
  ];
  const isProtectedPath = protectedPaths.some((p) => path.startsWith(p));

  const isAdminPath = path.startsWith("/admin");
  const isAuthPath = path.startsWith("/auth");

  // 💹 0. Redirect logged-in users away from auth pages.
  // This also protects intercepted auth modal navigation,
  // because the requested URL is still /auth/signin or /auth/signup.
  if (isAuthPath && isLoggedIn) {
    return NextResponse.redirect(new URL("/", nextUrl.origin));
  }

  // ✅ 1. Auth protection first
  // Redirect to signin page if accessing protected path without authentication
  if (isProtectedPath && !isLoggedIn && !isAuthPath) {
    const redirectUrl = new URL("/auth/signin", nextUrl.origin);
    redirectUrl.searchParams.set("callbackUrl", path + nextUrl.search);
    return NextResponse.redirect(redirectUrl);
  }

  // ✅ 2. Admin protection
  // Redirect to home if accessing admin path without admin authentication
  if (isAdminPath && isLoggedIn && !isAdmin) {
    return NextResponse.redirect(new URL("/", nextUrl.origin));
  }

  // ✅ 3. Checkout guard
  // To check if the use has permission to access checkout and checkout
  if (path.startsWith("/checkout/") || path === "/checkout") {
    const hasIntent = req.cookies.get("checkoutIntent")?.value === "cart";

    if (!hasIntent) {
      return NextResponse.redirect(new URL("/cart", req.url));
    }

    const response = NextResponse.next();

    // ✅ clear cookie after use
    // response.cookies.set("checkoutIntent", "", {
    //   maxAge: 0,
    //   path: "/",
    // });
    return response;
  }

  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

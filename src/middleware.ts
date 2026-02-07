import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { authLimiter, adLimiter, transactionLimiter, generalLimiter } from "@/lib/rate-limit";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // --- Rate Limiting for API routes ---
  if (pathname.startsWith("/api/")) {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
    const userId = req.auth?.user?.id;
    const identifier = userId || ip;

    let result: { allowed: boolean; retryAfter: number };

    if (pathname === "/api/auth/callback/credentials" || pathname === "/api/auth/signin") {
      result = authLimiter.check(identifier);
    } else if (pathname.startsWith("/api/auth/")) {
      // Session reads, CSRF, providers — don't rate limit heavily
      result = generalLimiter.check(identifier);
    } else if (pathname.startsWith("/api/ads/watch")) {
      result = adLimiter.check(identifier);
    } else if (
      pathname.startsWith("/api/fund") ||
      pathname.startsWith("/api/contribute") ||
      pathname.match(/^\/api\/loans\/[^/]+\/fund/)
    ) {
      result = transactionLimiter.check(identifier);
    } else {
      result = generalLimiter.check(identifier);
    }

    if (!result.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        {
          status: 429,
          headers: { "Retry-After": String(result.retryAfter) },
        }
      );
    }
  }

  // Protected routes — require authentication
  const protectedPaths = [
    "/dashboard",
    "/watch",
    "/fund",
    "/contribute",
    "/impact",
    "/account",
    "/loans",
    "/communities",
    "/aquifer",
    "/admin",
    "/leaderboards",
    "/challenges",
    "/proposals",
    "/business",
    "/onboarding",
    "/feed",
    "/volunteer",
  ];

  const isProtected = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // Admin routes — require admin role
  if (pathname.startsWith("/admin") && req.auth?.user?.accountType !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  // User-only routes — block admins, redirect to /admin
  const userOnlyPaths = ["/dashboard", "/watch", "/fund", "/contribute", "/impact", "/account", "/loans", "/communities", "/aquifer", "/leaderboards", "/challenges", "/proposals", "/business", "/onboarding", "/volunteer"];
  if (userOnlyPaths.some(p => pathname.startsWith(p)) && req.auth?.user?.accountType === "admin") {
    return NextResponse.redirect(new URL("/admin", req.nextUrl));
  }

  // Redirect logged-in users away from auth pages
  if ((pathname === "/login" || pathname === "/register") && isLoggedIn) {
    const dest = req.auth?.user?.accountType === "admin" ? "/admin" : "/dashboard";
    return NextResponse.redirect(new URL(dest, req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

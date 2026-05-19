import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { COOKIE_NAME } from "@/constants";

const PUBLIC_PATHS = ["/", "/login", "/signup", "/forgot-password"];
const AUTH_PATHS = ["/login", "/signup", "/forgot-password", "/reset-password"];

const ROLE_PATHS: Record<string, string[]> = {
  patient: ["/dashboard/patient", "/appointments", "/doctors", "/profile", "/notifications", "/settings"],
  doctor: ["/dashboard/doctor", "/appointments", "/patients", "/profile", "/notifications", "/settings"],
  admin: ["/dashboard/admin", "/appointments", "/doctors", "/patients", "/profile", "/notifications", "/settings"],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  // Allow public paths & API routes
  if (
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    // Redirect logged-in users away from auth pages
    if (AUTH_PATHS.includes(pathname) && token) {
      try {
        const payload = await verifyToken(token);
        return NextResponse.redirect(
          new URL(`/dashboard/${payload.role}`, request.url)
        );
      } catch {
        // Invalid token — clear it
        const response = NextResponse.next();
        response.cookies.delete(COOKIE_NAME);
        return response;
      }
    }
    return NextResponse.next();
  }

  // Protected routes — require token
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const payload = await verifyToken(token);
    const role = payload.role as "patient" | "doctor" | "admin";

    // Role-based access control
    if (pathname.startsWith("/dashboard")) {
      const allowedDashboard = `/dashboard/${role}`;
      if (!pathname.startsWith(allowedDashboard)) {
        return NextResponse.redirect(new URL(allowedDashboard, request.url));
      }
    }

    // Forward user info in headers to API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", payload.userId);
    requestHeaders.set("x-user-email", payload.email);
    requestHeaders.set("x-user-role", payload.role);

    return NextResponse.next({ request: { headers: requestHeaders } });
  } catch {
    // Token expired or invalid
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete(COOKIE_NAME);
    return response;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};

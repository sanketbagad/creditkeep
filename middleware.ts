import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "./lib/auth"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public paths that don't require authentication
  const publicPaths = [
    "/",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/verify-otp",
    "/borrower-lookup",
    "/help"
  ]
  const isPublicPath = publicPaths.includes(pathname)

  // API routes that don't require auth
  if (
    pathname.startsWith("/api/") &&
    !pathname.startsWith("/api/auth/me") &&
    !pathname.startsWith("/api/shops") &&
    !pathname.startsWith("/api/transactions") &&
    !pathname.startsWith("/api/analytics") &&
    !pathname.startsWith("/api/lend-transactions") &&
    !pathname.startsWith("/api/borrower-details") &&
    !pathname.startsWith("/api/my-borrowers") &&
    !pathname.startsWith("/api/my-borrowing") &&
    !pathname.startsWith("/api/send-reminder") &&
    !pathname.startsWith("/api/shop-borrower-lookup") &&
    !pathname.startsWith("/api/mark-payment") &&
    !pathname.startsWith("/api/my-customers")
  ) {
    return NextResponse.next()
  }

  // Check for auth token
  const token = request.cookies.get("auth-token")?.value

  if (!token) {
    // If no token and trying to access protected route, redirect to login
    if (!isPublicPath) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    return NextResponse.next()
  }

  // Verify token
  const decoded = await verifyToken(token)
  if (!decoded) {
    // Invalid token, clear cookie and redirect to login
    const response = NextResponse.redirect(new URL("/login", request.url))
    response.cookies.delete("auth-token")
    return response
  }

  // If authenticated and trying to access public auth pages, redirect to dashboard
  if (isPublicPath && (pathname === "/login" || pathname === "/signup" || pathname === "/")) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.json|icons|sw.js|screenshots).*)"],
}

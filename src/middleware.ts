import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // 1. If user is authenticated and tries to access login or landing page, redirect to dashboard
  if (token && (pathname === "/login" || pathname === "/")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // 2. If user is NOT authenticated and tries to access dashboard, redirect to login
  if (!token && pathname.startsWith("/dashboard")) {
    const loginUrl = new URL("/login", req.url);
    // Optional: add callbackUrl
    // loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/"],
};

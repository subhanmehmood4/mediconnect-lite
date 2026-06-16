import { NextResponse, type NextRequest } from "next/server";
import {
  demoRoleCookieOptions,
  getDemoRoleFromRequest,
  isDemoMode,
} from "@/lib/demoMode";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const protectedPrefixes = ["/patient", "/doctor", "/consult"];
  const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p));

  if (isDemoMode()) {
    const demoRole = getDemoRoleFromRequest(request);

    if (isProtected && !demoRole) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }

    if (pathname.startsWith("/patient") && demoRole === "doctor") {
      return NextResponse.redirect(new URL("/doctor", request.url));
    }

    if (pathname.startsWith("/doctor") && demoRole === "patient") {
      return NextResponse.redirect(new URL("/patient", request.url));
    }

    if (pathname === "/login" && demoRole) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = demoRole === "doctor" ? "/doctor" : "/patient";
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next();
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    if (isProtected) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  const { supabaseResponse, user, role } = await updateSession(request);

  if (isProtected && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (pathname.startsWith("/patient") && role && role !== "patient") {
    return NextResponse.redirect(new URL("/doctor", request.url));
  }

  if (pathname.startsWith("/doctor") && role && role !== "doctor") {
    return NextResponse.redirect(new URL("/patient", request.url));
  }

  if (pathname === "/login" && user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = role === "doctor" ? "/doctor" : "/patient";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/patient/:path*", "/doctor/:path*", "/consult/:path*", "/login"],
};

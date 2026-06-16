import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const { pathname } = request.nextUrl;

  if (!url || !key) {
    if (
      pathname.startsWith("/patient") ||
      pathname.startsWith("/doctor") ||
      pathname.startsWith("/consult")
    ) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  const { supabaseResponse, user, role } = await updateSession(request);

  const protectedPrefixes = ["/patient", "/doctor", "/consult"];
  const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p));

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

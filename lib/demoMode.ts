import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { isFullyConfigured } from "@/lib/env";
import type { UserRole } from "@/lib/types";

export const DEMO_ROLE_COOKIE = "mc_demo_role";

export function isDemoMode(): boolean {
  return !isFullyConfigured();
}

export function getDemoRoleFromRequest(request: NextRequest): UserRole | null {
  const value = request.cookies.get(DEMO_ROLE_COOKIE)?.value;
  if (value === "patient" || value === "doctor") return value;
  return null;
}

export async function getDemoRoleFromCookies(): Promise<UserRole | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(DEMO_ROLE_COOKIE)?.value;
  if (value === "patient" || value === "doctor") return value;
  return null;
}

export const demoRoleCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24,
};

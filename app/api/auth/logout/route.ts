import { NextResponse } from "next/server";
import { DEMO_ROLE_COOKIE, demoRoleCookieOptions, isDemoMode } from "@/lib/demoMode";

export async function POST() {
  const response = NextResponse.json({ ok: true });

  response.cookies.set(DEMO_ROLE_COOKIE, "", { ...demoRoleCookieOptions, maxAge: 0 });
  response.cookies.set("mc_demo_state", "", { ...demoRoleCookieOptions, maxAge: 0 });

  if (!isDemoMode()) {
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();
      await supabase.auth.signOut();
    } catch {
      // Supabase unavailable
    }
  }

  return response;
}

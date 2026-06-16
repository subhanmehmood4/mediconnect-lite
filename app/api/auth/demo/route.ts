import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import {
  DEMO_ROLE_COOKIE,
  demoRoleCookieOptions,
  isDemoMode,
} from "@/lib/demoMode";
import { getDemoCredentials } from "@/lib/env";
import type { UserRole } from "@/lib/types";

export async function POST(request: Request) {
  let role: UserRole = "patient";
  try {
    const body = (await request.json()) as { role?: UserRole };
    if (body.role === "doctor" || body.role === "patient") {
      role = body.role;
    }
  } catch {
    // default patient
  }

  if (isDemoMode()) {
    const response = NextResponse.json({ ok: true, role, demoMode: true });
    response.cookies.set(DEMO_ROLE_COOKIE, role, demoRoleCookieOptions);
    return response;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return NextResponse.json(
      {
        error:
          "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      },
      { status: 503 }
    );
  }

  const cookieStore = await cookies();
  let response = NextResponse.json({ ok: true, role });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        );
        response = NextResponse.json({ ok: true, role });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const credentials = getDemoCredentials(role);

  if (!credentials) {
    return NextResponse.json(
      {
        error: `Demo ${role} credentials not configured. Set DEMO_PATIENT_EMAIL / DEMO_DOCTOR_EMAIL env vars.`,
      },
      { status: 503 }
    );
  }

  const { error } = await supabase.auth.signInWithPassword(credentials);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  return response;
}

import { NextResponse } from "next/server";
import { getMissingEnvVars, isDailyConfigured } from "@/lib/env";
import { isDemoMode } from "@/lib/demoMode";

export async function GET() {
  const missing = getMissingEnvVars();
  return NextResponse.json({
    ok: isDemoMode() || missing.length === 0,
    demoMode: isDemoMode(),
    missing,
    daily: isDailyConfigured(),
  });
}

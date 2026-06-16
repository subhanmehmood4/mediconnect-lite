import { NextResponse } from "next/server";
import { getMissingEnvVars, isDailyConfigured } from "@/lib/env";

export async function GET() {
  const missing = getMissingEnvVars();
  return NextResponse.json({
    ok: missing.length === 0,
    missing,
    daily: isDailyConfigured(),
  });
}

import type { UserRole } from "@/lib/types";

export function getMissingEnvVars(): string[] {
  const missing: string[] = [];
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  return missing;
}

export function isFullyConfigured(): boolean {
  return getMissingEnvVars().length === 0;
}

export function getDemoCredentials(
  role: UserRole
): { email: string; password: string } | null {
  if (role === "patient") {
    const email = process.env.DEMO_PATIENT_EMAIL;
    const password = process.env.DEMO_PATIENT_PASSWORD;
    if (!email || !password) return null;
    return { email, password };
  }

  const email = process.env.DEMO_DOCTOR_EMAIL;
  const password = process.env.DEMO_DOCTOR_PASSWORD;
  if (!email || !password) return null;
  return { email, password };
}

export function isDailyConfigured(): boolean {
  return Boolean(process.env.DAILY_API_KEY);
}

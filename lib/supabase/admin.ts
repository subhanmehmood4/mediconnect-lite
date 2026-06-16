import { createClient } from "@supabase/supabase-js";
import type { Profile } from "@/lib/types";

export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase service role is not configured");
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function getCurrentProfile(userId: string): Promise<Profile | null> {
  const supabase = await import("@/lib/supabase/server").then((m) => m.createClient());
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  return data as Profile | null;
}

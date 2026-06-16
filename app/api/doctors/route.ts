import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/demoMode";
import { getDemoDoctors } from "@/lib/demoStore";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  if (isDemoMode()) {
    const doctors = await getDemoDoctors();
    return NextResponse.json({ doctors });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, specialty")
    .eq("role", "doctor")
    .order("full_name");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ doctors: data ?? [] });
}

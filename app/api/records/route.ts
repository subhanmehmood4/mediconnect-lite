import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [recordsRes, rxRes] = await Promise.all([
    supabase
      .from("patient_records")
      .select("*")
      .eq("patient_id", user.id)
      .order("recorded_at", { ascending: false }),
    supabase
      .from("prescriptions")
      .select("*")
      .eq("patient_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  if (recordsRes.error || rxRes.error) {
    return NextResponse.json(
      { error: recordsRes.error?.message ?? rxRes.error?.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    records: recordsRes.data ?? [],
    prescriptions: rxRes.data ?? [],
  });
}

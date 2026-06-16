import PatientRecordsList from "@/components/PatientRecordsList";
import { createClient } from "@/lib/supabase/server";
import type { PatientRecord, Prescription } from "@/lib/types";

export default async function PatientRecordsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [recordsRes, rxRes] = await Promise.all([
    supabase
      .from("patient_records")
      .select("*")
      .eq("patient_id", user!.id)
      .order("recorded_at", { ascending: false }),
    supabase
      .from("prescriptions")
      .select("*")
      .eq("patient_id", user!.id)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold text-white">Health records</h1>
      <p className="mt-1 mb-8 text-sm text-slate-400">
        Encrypted records and prescriptions from your telehealth visits.
      </p>
      <PatientRecordsList
        records={(recordsRes.data ?? []) as PatientRecord[]}
        prescriptions={(rxRes.data ?? []) as Prescription[]}
      />
    </div>
  );
}

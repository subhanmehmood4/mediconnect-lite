import PatientRecordsList from "@/components/PatientRecordsList";
import { isDemoMode } from "@/lib/demoMode";
import { DEMO_PATIENT_ID, getDemoRecords } from "@/lib/demoStore";
import { createClient } from "@/lib/supabase/server";
import type { PatientRecord, Prescription } from "@/lib/types";

export default async function PatientRecordsPage() {
  let records: PatientRecord[] = [];
  let prescriptions: Prescription[] = [];

  if (isDemoMode()) {
    const data = await getDemoRecords(DEMO_PATIENT_ID);
    records = data.records;
    prescriptions = data.prescriptions;
  } else {
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
    records = (recordsRes.data ?? []) as PatientRecord[];
    prescriptions = (rxRes.data ?? []) as Prescription[];
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold text-white">Health records</h1>
      <p className="mt-1 mb-8 text-sm text-slate-400">
        Encrypted records and prescriptions from your telehealth visits.
      </p>
      <PatientRecordsList records={records} prescriptions={prescriptions} />
    </div>
  );
}

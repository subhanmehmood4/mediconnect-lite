import PrescriptionForm from "@/components/PrescriptionForm";
import PatientRecordsList from "@/components/PatientRecordsList";
import Link from "next/link";
import { isDemoMode } from "@/lib/demoMode";
import { getDemoProfileById } from "@/lib/demoData";
import { getDemoRecords } from "@/lib/demoStore";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { PatientRecord, Prescription, Profile } from "@/lib/types";

interface Props {
  params: { id: string };
  searchParams: { appointment?: string };
}

export default async function DoctorPatientPage({ params, searchParams }: Props) {
  let patient: Profile | null = null;
  let records: PatientRecord[] = [];
  let prescriptions: Prescription[] = [];

  if (isDemoMode()) {
    patient = getDemoProfileById(params.id);
    if (!patient) notFound();
    const data = await getDemoRecords(params.id);
    records = data.records;
    prescriptions = data.prescriptions;
  } else {
    const supabase = await createClient();
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", params.id)
      .eq("role", "patient")
      .maybeSingle();

    if (!data) notFound();
    patient = data as Profile;

    const [recordsRes, rxRes] = await Promise.all([
      supabase
        .from("patient_records")
        .select("*")
        .eq("patient_id", params.id)
        .order("recorded_at", { ascending: false }),
      supabase
        .from("prescriptions")
        .select("*")
        .eq("patient_id", params.id)
        .order("created_at", { ascending: false }),
    ]);
    records = (recordsRes.data ?? []) as PatientRecord[];
    prescriptions = (rxRes.data ?? []) as Prescription[];
  }

  const appointmentId = searchParams.appointment;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <Link href="/doctor" className="text-sm text-slate-400 hover:text-white">
          ← Schedule
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-white">{patient.full_name}</h1>
        <p className="mt-1 text-sm text-slate-400">Patient profile & documentation</p>
      </div>

      {appointmentId && (
        <PrescriptionForm
          appointmentId={appointmentId}
          patientId={params.id}
        />
      )}

      <PatientRecordsList records={records} prescriptions={prescriptions} />
    </div>
  );
}

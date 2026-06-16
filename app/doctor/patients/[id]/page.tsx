import PrescriptionForm from "@/components/PrescriptionForm";
import PatientRecordsList from "@/components/PatientRecordsList";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { PatientRecord, Prescription } from "@/lib/types";

interface Props {
  params: { id: string };
  searchParams: { appointment?: string };
}

export default async function DoctorPatientPage({ params, searchParams }: Props) {
  const supabase = await createClient();

  const { data: patient } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", params.id)
    .eq("role", "patient")
    .maybeSingle();

  if (!patient) notFound();

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

      <PatientRecordsList
        records={(recordsRes.data ?? []) as PatientRecord[]}
        prescriptions={(rxRes.data ?? []) as Prescription[]}
      />
    </div>
  );
}

import AppointmentCard from "@/components/AppointmentCard";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Appointment } from "@/lib/types";

export default async function DoctorDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const { data: todayAppts } = await supabase
    .from("appointments")
    .select(
      `*, patient:profiles!appointments_patient_id_fkey(id, full_name, role, specialty)`
    )
    .eq("doctor_id", user!.id)
    .gte("scheduled_at", start.toISOString())
    .lte("scheduled_at", end.toISOString())
    .order("scheduled_at", { ascending: true });

  const { data: allAppts } = await supabase
    .from("appointments")
    .select(
      `*, patient:profiles!appointments_patient_id_fkey(id, full_name, role, specialty)`
    )
    .eq("doctor_id", user!.id)
    .order("scheduled_at", { ascending: true });

  const today = (todayAppts as Appointment[] | null) ?? [];
  const upcoming =
    (allAppts as Appointment[] | null)?.filter(
      (a) =>
        a.status !== "completed" &&
        a.status !== "cancelled" &&
        !today.find((t) => t.id === a.id)
    ) ?? [];

  const patientIds = new Set(
    (allAppts ?? []).map((a: Appointment) => a.patient_id)
  );

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Doctor dashboard</h1>
        <p className="mt-1 text-sm text-slate-400">
          Today&apos;s schedule and patient queue.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="glass-card p-5 text-center">
          <p className="text-3xl font-bold text-violet-400">{today.length}</p>
          <p className="mt-1 text-xs font-mono uppercase tracking-widest text-slate-500">
            Today
          </p>
        </div>
        <div className="glass-card p-5 text-center">
          <p className="text-3xl font-bold text-violet-400">{upcoming.length}</p>
          <p className="mt-1 text-xs font-mono uppercase tracking-widest text-slate-500">
            Upcoming
          </p>
        </div>
        <div className="glass-card p-5 text-center">
          <p className="text-3xl font-bold text-violet-400">{patientIds.size}</p>
          <p className="mt-1 text-xs font-mono uppercase tracking-widest text-slate-500">
            Patients
          </p>
        </div>
      </div>

      <section>
        <h2 className="mb-4 text-xs font-mono uppercase tracking-widest text-slate-500">
          Today&apos;s consultations
        </h2>
        {today.length === 0 ? (
          <div className="glass-card p-6 text-sm text-slate-400">
            No appointments scheduled for today.
          </div>
        ) : (
          <div className="space-y-4">
            {today.map((appt) => (
              <div key={appt.id} className="space-y-3">
                <AppointmentCard appointment={appt} role="doctor" />
                {appt.patient && (
                  <Link
                    href={`/doctor/patients/${appt.patient.id}?appointment=${appt.id}`}
                    className="inline-block text-xs text-violet-400 hover:underline"
                  >
                    View patient & prescribe →
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {upcoming.length > 0 && (
        <section>
          <h2 className="mb-4 text-xs font-mono uppercase tracking-widest text-slate-500">
            Upcoming
          </h2>
          <div className="space-y-4">
            {upcoming.map((appt) => (
              <AppointmentCard key={appt.id} appointment={appt} role="doctor" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

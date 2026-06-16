import AppointmentCard from "@/components/AppointmentCard";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Appointment } from "@/lib/types";

export default async function PatientDashboardPage() {
  const supabase = await createClient();
  const { data: appointments } = await supabase
    .from("appointments")
    .select(
      `*, doctor:profiles!appointments_doctor_id_fkey(id, full_name, role, specialty)`
    )
    .order("scheduled_at", { ascending: true });

  const upcoming =
    (appointments as Appointment[] | null)?.filter(
      (a) => a.status !== "completed" && a.status !== "cancelled"
    ) ?? [];

  const past =
    (appointments as Appointment[] | null)?.filter(
      (a) => a.status === "completed"
    ) ?? [];

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Your care</h1>
          <p className="mt-1 text-sm text-slate-400">
            Upcoming telehealth visits and quick actions.
          </p>
        </div>
        <Link
          href="/patient/book"
          className="rounded-xl bg-violet-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-violet-400"
        >
          Book visit
        </Link>
      </div>

      <section>
        <h2 className="mb-4 text-xs font-mono uppercase tracking-widest text-slate-500">
          Upcoming
        </h2>
        {upcoming.length === 0 ? (
          <div className="glass-card p-6 text-sm text-slate-400">
            No upcoming appointments.{" "}
            <Link href="/patient/book" className="text-violet-400 hover:underline">
              Book your first visit
            </Link>
            .
          </div>
        ) : (
          <div className="space-y-4">
            {upcoming.map((appt) => (
              <AppointmentCard key={appt.id} appointment={appt} role="patient" />
            ))}
          </div>
        )}
      </section>

      {past.length > 0 && (
        <section>
          <h2 className="mb-4 text-xs font-mono uppercase tracking-widest text-slate-500">
            Past visits
          </h2>
          <div className="space-y-4">
            {past.map((appt) => (
              <AppointmentCard key={appt.id} appointment={appt} role="patient" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

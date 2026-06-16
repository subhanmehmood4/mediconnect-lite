import Link from "next/link";
import { canJoinConsultation, formatAppointmentTime, statusLabel } from "@/lib/appointments";
import type { Appointment } from "@/lib/types";

interface Props {
  appointment: Appointment;
  role: "patient" | "doctor";
}

export default function AppointmentCard({ appointment, role }: Props) {
  const other =
    role === "patient" ? appointment.doctor : appointment.patient;
  const canJoin = canJoinConsultation(
    appointment.scheduled_at,
    appointment.status
  );

  return (
    <div className="glass-card p-5 shadow-soft animate-slide-up">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-violet-400/80">
            {statusLabel(appointment.status)}
          </p>
          <h3 className="mt-1 text-lg font-semibold text-white">
            {formatAppointmentTime(appointment.scheduled_at)}
          </h3>
          <p className="mt-1 text-sm text-slate-400">
            {role === "patient" ? "Dr. " : "Patient: "}
            {other?.full_name ?? "—"}
            {appointment.doctor?.specialty
              ? ` · ${appointment.doctor.specialty}`
              : ""}
          </p>
        </div>
        {(canJoin || appointment.status === "in_progress") && (
          <Link
            href={`/consult/${appointment.id}`}
            className="rounded-xl bg-violet-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-violet-400"
          >
            {role === "doctor" ? "Start Consultation" : "Join Consultation"}
          </Link>
        )}
      </div>
      {appointment.notes && (
        <p className="mt-3 border-t border-slate-800 pt-3 text-sm text-slate-400">
          Notes: {appointment.notes}
        </p>
      )}
      {!canJoin && appointment.status === "scheduled" && (
        <p className="mt-3 text-xs text-slate-500">
          Click Join when you are ready for your telehealth visit.
        </p>
      )}
    </div>
  );
}

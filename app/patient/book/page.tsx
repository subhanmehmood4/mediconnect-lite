"use client";

import SchedulePicker from "@/components/SchedulePicker";
import { buildScheduledAt } from "@/lib/appointments";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Doctor {
  id: string;
  full_name: string;
  specialty: string | null;
}

export default function BookVisitPage() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reminderSent, setReminderSent] = useState(false);

  useEffect(() => {
    fetch("/api/doctors")
      .then((r) => r.json())
      .then((data: { doctors?: Doctor[] }) => {
        setDoctors(data.doctors ?? []);
        if (data.doctors?.[0]) setDoctorId(data.doctors[0].id);
      });
  }, []);

  async function handleBook() {
    if (!doctorId || !selectedDate || !selectedTime) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId,
          scheduledAt: buildScheduledAt(selectedDate, selectedTime),
        }),
      });

      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Booking failed");

      setReminderSent(true);
      setTimeout(() => router.push("/patient"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <Link href="/patient" className="text-sm text-slate-400 hover:text-white">
          ← Dashboard
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-white">Book a visit</h1>
        <p className="mt-1 text-sm text-slate-400">
          Choose your provider and a time slot for a telehealth consultation.
        </p>
      </div>

      <div className="glass-card space-y-6 p-6">
        <div>
          <p className="mb-3 text-xs font-mono uppercase tracking-widest text-slate-500">
            Select doctor
          </p>
          <div className="space-y-2">
            {doctors.map((doc) => (
              <button
                key={doc.id}
                type="button"
                onClick={() => setDoctorId(doc.id)}
                className={`w-full rounded-xl px-4 py-3 text-left text-sm transition ${
                  doctorId === doc.id
                    ? "bg-violet-500/20 ring-1 ring-violet-500/40"
                    : "border border-slate-700 hover:border-violet-500/30"
                }`}
              >
                <span className="font-medium text-white">Dr. {doc.full_name}</span>
                {doc.specialty && (
                  <span className="mt-0.5 block text-xs text-slate-400">
                    {doc.specialty}
                  </span>
                )}
              </button>
            ))}
            {doctors.length === 0 && (
              <p className="text-sm text-slate-500">No doctors available.</p>
            )}
          </div>
        </div>

        <SchedulePicker
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onDateChange={setSelectedDate}
          onTimeChange={setSelectedTime}
        />

        {error && (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        {reminderSent && (
          <p className="rounded-xl border border-violet-500/30 bg-violet-500/10 px-3 py-2 text-sm text-violet-200">
            Appointment confirmed. Reminder sent (simulated).
          </p>
        )}

        <button
          type="button"
          onClick={handleBook}
          disabled={loading || !doctorId || !selectedDate || !selectedTime}
          className="w-full rounded-xl bg-violet-500 py-3 text-sm font-semibold text-slate-950 hover:bg-violet-400 disabled:opacity-50"
        >
          {loading ? "Booking..." : "Confirm appointment"}
        </button>
      </div>
    </div>
  );
}

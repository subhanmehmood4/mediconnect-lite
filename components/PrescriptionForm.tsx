"use client";

import { FormEvent, useState } from "react";

interface Props {
  appointmentId: string;
  patientId: string;
  onSaved?: () => void;
}

export default function PrescriptionForm({
  appointmentId,
  patientId,
  onSaved,
}: Props) {
  const [medication, setMedication] = useState("");
  const [dosage, setDosage] = useState("");
  const [instructions, setInstructions] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId,
          notes,
          prescription: { medication, dosage, instructions, patientId },
        }),
      });

      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to save");

      setSuccess(true);
      onSaved?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card space-y-4 p-6">
      <h3 className="text-lg font-semibold text-white">Post-visit notes & e-prescription</h3>

      <div>
        <label className="mb-1.5 block text-xs text-slate-400">Visit notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-violet-500/50 focus:outline-none"
          placeholder="Summary of consultation..."
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs text-slate-400">Medication</label>
        <input
          value={medication}
          onChange={(e) => setMedication(e.target.value)}
          required
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-violet-500/50 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs text-slate-400">Dosage</label>
        <input
          value={dosage}
          onChange={(e) => setDosage(e.target.value)}
          required
          placeholder="e.g. 500mg twice daily"
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-violet-500/50 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs text-slate-400">Instructions</label>
        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          required
          rows={2}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-violet-500/50 focus:outline-none"
        />
      </div>

      {error && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-xl border border-violet-500/30 bg-violet-500/10 px-3 py-2 text-sm text-violet-200">
          Prescription saved successfully.
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-violet-500 px-6 py-2.5 text-sm font-semibold text-slate-950 hover:bg-violet-400 disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save prescription"}
      </button>
    </form>
  );
}

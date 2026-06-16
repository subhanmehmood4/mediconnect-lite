import type { PatientRecord, Prescription } from "@/lib/types";

interface Props {
  records: PatientRecord[];
  prescriptions: Prescription[];
}

function maskId(id: string): string {
  return `****-${id.slice(-4)}`;
}

export default function PatientRecordsList({ records, prescriptions }: Props) {
  return (
    <div className="space-y-6">
      <section>
        <div className="mb-4 flex items-center gap-2">
          <span className="text-lg">🔒</span>
          <h2 className="text-sm font-mono uppercase tracking-widest text-slate-400">
            Encrypted health records
          </h2>
        </div>
        {records.length === 0 ? (
          <p className="text-sm text-slate-500">No records on file yet.</p>
        ) : (
          <div className="space-y-3">
            {records.map((record) => (
              <div key={record.id} className="glass-card p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-white">{record.title}</p>
                  <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-400">
                    ID {maskId(record.id)}
                  </span>
                </div>
                <p className="mt-1 text-xs uppercase tracking-wide text-violet-400/70">
                  {record.record_type}
                </p>
                <p className="mt-2 text-sm text-slate-400">{record.summary}</p>
                <p className="mt-2 text-xs text-slate-500">
                  {new Date(record.recorded_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-sm font-mono uppercase tracking-widest text-slate-400">
          Prescriptions
        </h2>
        {prescriptions.length === 0 ? (
          <p className="text-sm text-slate-500">No prescriptions yet.</p>
        ) : (
          <div className="space-y-3">
            {prescriptions.map((rx) => (
              <div key={rx.id} className="glass-card border-violet-500/20 p-4">
                <p className="font-medium text-white">{rx.medication}</p>
                <p className="mt-1 text-sm text-violet-300">{rx.dosage}</p>
                <p className="mt-2 text-sm text-slate-400">{rx.instructions}</p>
                <p className="mt-2 text-xs text-slate-500">
                  Issued {new Date(rx.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

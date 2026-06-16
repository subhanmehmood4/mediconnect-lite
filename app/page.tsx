import Link from "next/link";

const STEPS = [
  {
    step: "1",
    title: "Book a visit",
    description:
      "Patients pick a doctor, choose a time slot, and get an automated reminder confirmation.",
  },
  {
    step: "2",
    title: "Join via WebRTC",
    description:
      "Real video consultations powered by Daily.co — no plugins, works in the browser.",
  },
  {
    step: "3",
    title: "Records & prescriptions",
    description:
      "Doctors add visit notes and e-prescriptions. Patients view encrypted records in their portal.",
  },
];

const FEATURES = [
  {
    title: "Patient portal",
    description: "Upcoming visits, health records, and prescription history in one place.",
  },
  {
    title: "Doctor dashboard",
    description: "Today's schedule, patient queue, and post-visit documentation.",
  },
  {
    title: "HIPAA-aware design",
    description:
      "Role-based access, encrypted record UI patterns, and audit-friendly architecture — demo only.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-3xl" />
      </div>

      <header className="relative mx-auto flex max-w-6xl items-center justify-between px-4 py-6 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 ring-1 ring-violet-500/30">
            <span className="font-bold text-violet-400">M</span>
          </div>
          <span className="text-lg font-semibold text-white">MediConnect</span>
        </div>
        <Link
          href="/login"
          className="rounded-xl bg-violet-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-violet-400"
        >
          Try demo
        </Link>
      </header>

      <main className="relative mx-auto max-w-6xl px-4 pb-20 pt-12 sm:px-6 sm:pt-20">
        <section className="mx-auto max-w-3xl text-center animate-slide-up">
          <p className="mb-4 text-xs font-mono uppercase tracking-[0.25em] text-violet-400">
            Telehealth SaaS · by DevAxon
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Custom telehealth your practice owns
          </h1>
          <p className="mt-6 text-lg text-slate-400">
            Scheduling, patient portal, doctor dashboard, and WebRTC video consults —
            try the full platform as a patient or doctor.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/login"
              className="w-full rounded-xl bg-violet-500 px-8 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-violet-400 sm:w-auto"
            >
              Enter demo
            </Link>
            <a
              href="https://www.devaxon.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full rounded-xl border border-slate-700 px-8 py-3.5 text-sm font-medium text-white transition hover:border-slate-500 sm:w-auto"
            >
              Built by DevAxon
            </a>
          </div>
          <p className="mt-6 text-xs text-slate-500">
            Tip: open patient in one browser window and doctor in another to test video calls.
          </p>
        </section>

        <section className="mt-24 grid gap-6 md:grid-cols-3">
          {STEPS.map((item) => (
            <div key={item.step} className="glass-card p-6 shadow-soft">
              <span className="text-xs font-mono text-violet-400">Step {item.step}</span>
              <h2 className="mt-2 text-lg font-semibold text-white">{item.title}</h2>
              <p className="mt-2 text-sm text-slate-400">{item.description}</p>
            </div>
          ))}
        </section>

        <section className="mt-16 grid gap-6 md:grid-cols-3">
          {FEATURES.map((item) => (
            <div key={item.title} className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
              <h3 className="font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-400">{item.description}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDemoLogin(role: "patient" | "doctor") {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = (await res.json()) as { error?: string; role?: string };

      if (!res.ok) {
        throw new Error(data.error ?? "Demo login failed");
      }

      const path =
        redirect ??
        (data.role === "doctor" || role === "doctor" ? "/doctor" : "/patient");
      router.push(path);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Demo login failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();

    try {
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .maybeSingle();

      const path =
        redirect ??
        (profile?.role === "doctor" ? "/doctor" : "/patient");
      router.push(path);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
        >
          ← Back to home
        </Link>

        <div className="glass-card p-8 shadow-card animate-slide-up">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/15 ring-1 ring-violet-500/30">
              <span className="font-bold text-violet-400">M</span>
            </div>
            <h1 className="text-2xl font-semibold text-white">Try MediConnect</h1>
            <p className="mt-2 text-sm text-slate-400">
              One-click demo — allow camera &amp; mic for video consults.
            </p>
          </div>

          <div className="grid gap-3">
            <button
              type="button"
              onClick={() => handleDemoLogin("patient")}
              disabled={loading}
              className="w-full rounded-xl bg-violet-500 py-3 text-sm font-semibold text-slate-950 transition hover:bg-violet-400 disabled:opacity-50"
            >
              Enter as Patient
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin("doctor")}
              disabled={loading}
              className="w-full rounded-xl border border-violet-500/40 bg-violet-500/10 py-3 text-sm font-semibold text-violet-200 transition hover:bg-violet-500/20 disabled:opacity-50"
            >
              Enter as Doctor
            </button>
          </div>

          <p className="mt-4 rounded-xl bg-slate-900/80 p-3 text-xs leading-relaxed text-slate-500">
            To test video: open this page in two windows — log in as Patient in one
            and Doctor in the other, then join the same appointment.
          </p>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-800" />
            <span className="text-xs text-slate-500">or use email</span>
            <div className="h-px flex-1 bg-slate-800" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-slate-400">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-slate-400">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              />
            </div>

            {error && (
              <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl border border-slate-700 py-3 text-sm font-medium text-white transition hover:border-slate-600 hover:bg-slate-900 disabled:opacity-50"
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <LoginForm />
    </Suspense>
  );
}

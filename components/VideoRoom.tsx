"use client";

import { useEffect, useRef, useState } from "react";
import DailyIframe from "@daily-co/daily-js";
import type { DailyCall } from "@daily-co/daily-js";
import { useRouter } from "next/navigation";

interface Props {
  appointmentId: string;
  role: "patient" | "doctor";
  redirectPath: string;
  demoMode?: boolean;
}

function MockVideoRoom({
  role,
  appointmentId,
  redirectPath,
}: {
  role: "patient" | "doctor";
  appointmentId: string;
  redirectPath: string;
}) {
  const router = useRouter();
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  async function endCall() {
    await fetch("/api/appointments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appointmentId, status: "completed" }),
    });
    router.push(redirectPath);
    router.refresh();
  }

  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Video consultation</h1>
          <p className="text-sm text-slate-400">
            Demo preview — WebRTC connects when Daily.co is configured in production.
          </p>
        </div>
        <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-mono text-emerald-400">
          Live · {mins}:{secs}
        </span>
      </div>

      <div className="grid flex-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-violet-950/40 p-8">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-violet-500/20 text-3xl font-bold text-violet-300">
            {role === "doctor" ? "Dr" : "Pt"}
          </div>
          <p className="mt-4 font-medium text-white">You ({role})</p>
          <p className="text-xs text-slate-500">Camera simulated</p>
        </div>
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-8">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-800 text-3xl font-bold text-slate-400">
            {role === "doctor" ? "Pt" : "Dr"}
          </div>
          <p className="mt-4 font-medium text-white">
            {role === "doctor" ? "Patient" : "Dr. Sarah Chen"}
          </p>
          <p className="text-xs text-slate-500">Waiting participant preview</p>
        </div>
      </div>

      <div className="mt-4 flex justify-center">
        <button
          type="button"
          onClick={endCall}
          className="rounded-xl bg-red-500/90 px-8 py-3 text-sm font-semibold text-white hover:bg-red-500"
        >
          End consultation
        </button>
      </div>
    </div>
  );
}

export default function VideoRoom({
  appointmentId,
  role,
  redirectPath,
  demoMode = false,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const callRef = useRef<DailyCall | null>(null);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(false);
  const [useMock, setUseMock] = useState(demoMode);

  useEffect(() => {
    if (demoMode) {
      setUseMock(true);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function joinRoom() {
      try {
        const res = await fetch("/api/rooms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ appointmentId }),
        });

        const data = (await res.json()) as {
          roomUrl?: string;
          token?: string;
          mockVideo?: boolean;
          demoMode?: boolean;
          error?: string;
        };

        if (data.mockVideo || data.demoMode) {
          if (!cancelled) {
            setUseMock(true);
            setLoading(false);
          }
          return;
        }

        if (!res.ok || !data.roomUrl) {
          throw new Error(data.error ?? "Failed to join room");
        }

        if (cancelled || !containerRef.current) return;

        const callFrame = DailyIframe.createFrame(containerRef.current, {
          showLeaveButton: true,
          showFullscreenButton: true,
          iframeStyle: {
            width: "100%",
            height: "100%",
            border: "0",
            borderRadius: "12px",
          },
        });

        callRef.current = callFrame;

        callFrame.on("joined-meeting", () => {
          if (!cancelled) setJoined(true);
        });

        callFrame.on("left-meeting", async () => {
          await fetch("/api/appointments", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              appointmentId,
              status: "completed",
            }),
          });
          router.push(redirectPath);
          router.refresh();
        });

        await callFrame.join({
          url: data.roomUrl,
          token: data.token,
        });

        if (!cancelled) setLoading(false);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to join video");
          setLoading(false);
        }
      }
    }

    joinRoom();

    return () => {
      cancelled = true;
      callRef.current?.destroy();
    };
  }, [appointmentId, redirectPath, router, demoMode]);

  if (useMock) {
    return (
      <MockVideoRoom
        role={role}
        appointmentId={appointmentId}
        redirectPath={redirectPath}
      />
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Video consultation</h1>
          <p className="text-sm text-slate-400">
            {role === "doctor"
              ? "You are hosting as the provider."
              : "Allow camera and microphone when prompted."}
          </p>
        </div>
        {joined && (
          <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-mono text-emerald-400">
            Live
          </span>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {loading && !error && (
        <div className="flex flex-1 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/50">
          <p className="text-sm text-slate-400">Connecting to video room...</p>
        </div>
      )}

      <div
        ref={containerRef}
        className={`flex-1 overflow-hidden rounded-2xl border border-slate-800 bg-black ${
          loading ? "hidden" : ""
        }`}
      />
    </div>
  );
}

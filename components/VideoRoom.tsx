"use client";

import { useEffect, useRef, useState } from "react";
import DailyIframe from "@daily-co/daily-js";
import type { DailyCall } from "@daily-co/daily-js";
import { useRouter } from "next/navigation";

interface Props {
  appointmentId: string;
  role: "patient" | "doctor";
  redirectPath: string;
}

export default function VideoRoom({ appointmentId, role, redirectPath }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const callRef = useRef<DailyCall | null>(null);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
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
          error?: string;
        };

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
  }, [appointmentId, redirectPath, router]);

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
          {!process.env.NEXT_PUBLIC_DAILY_CONFIGURED && (
            <p className="mt-2 text-xs">
              Ensure DAILY_API_KEY is set in your environment.
            </p>
          )}
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

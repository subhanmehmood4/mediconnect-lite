import {
  JOIN_WINDOW_MINUTES_AFTER,
  JOIN_WINDOW_MINUTES_BEFORE,
} from "@/lib/constants";
import type { AppointmentStatus } from "@/lib/types";

export function canJoinConsultation(
  scheduledAt: string,
  status: AppointmentStatus
): boolean {
  if (status === "cancelled" || status === "completed") return false;
  if (status === "in_progress") return true;

  // Demo: allow joining any scheduled visit for easier portfolio testing
  if (status === "scheduled") return true;

  const start = new Date(scheduledAt).getTime();
  const now = Date.now();
  const windowStart = start - JOIN_WINDOW_MINUTES_BEFORE * 60 * 1000;
  const windowEnd = start + JOIN_WINDOW_MINUTES_AFTER * 60 * 1000;

  return now >= windowStart && now <= windowEnd;
}

export function formatAppointmentTime(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function statusLabel(status: AppointmentStatus): string {
  switch (status) {
    case "scheduled":
      return "Scheduled";
    case "in_progress":
      return "In progress";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
}

export function getAvailableDates(count = 7): Date[] {
  const dates: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    if (d.getDay() !== 0 && d.getDay() !== 6) {
      dates.push(d);
    }
  }

  return dates.slice(0, count);
}

export function buildScheduledAt(date: Date, timeSlot: string): string {
  const [hours, minutes] = timeSlot.split(":").map(Number);
  const scheduled = new Date(date);
  scheduled.setHours(hours, minutes, 0, 0);
  return scheduled.toISOString();
}

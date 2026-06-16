"use client";

import { TIME_SLOTS } from "@/lib/constants";
import { getAvailableDates } from "@/lib/appointments";

interface Props {
  selectedDate: Date | null;
  selectedTime: string | null;
  onDateChange: (date: Date) => void;
  onTimeChange: (time: string) => void;
}

export default function SchedulePicker({
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
}: Props) {
  const dates = getAvailableDates(7);

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-3 text-xs font-mono uppercase tracking-widest text-slate-500">
          Select date
        </p>
        <div className="flex flex-wrap gap-2">
          {dates.map((date) => {
            const key = date.toISOString().slice(0, 10);
            const isSelected =
              selectedDate?.toISOString().slice(0, 10) === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onDateChange(date)}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                  isSelected
                    ? "bg-violet-500 text-slate-950"
                    : "border border-slate-700 text-slate-300 hover:border-violet-500/50"
                }`}
              >
                {date.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </button>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <div>
          <p className="mb-3 text-xs font-mono uppercase tracking-widest text-slate-500">
            Select time
          </p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {TIME_SLOTS.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => onTimeChange(slot)}
                className={`rounded-xl py-2 text-sm font-medium transition ${
                  selectedTime === slot
                    ? "bg-violet-500 text-slate-950"
                    : "border border-slate-700 text-slate-300 hover:border-violet-500/50"
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

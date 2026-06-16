import { NextResponse } from "next/server";
import { buildRoomName, createMeetingToken, getOrCreateRoom } from "@/lib/daily";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { isDailyConfigured } from "@/lib/env";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = checkRateLimit(ip);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests. Try again shortly." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } }
    );
  }

  if (!isDailyConfigured()) {
    return NextResponse.json(
      { error: "Daily.co is not configured. Set DAILY_API_KEY." },
      { status: 503 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { appointmentId } = (await request.json()) as { appointmentId?: string };
  if (!appointmentId) {
    return NextResponse.json({ error: "appointmentId required" }, { status: 400 });
  }

  const { data: appointment, error: fetchError } = await supabase
    .from("appointments")
    .select("*, patient:profiles!appointments_patient_id_fkey(full_name), doctor:profiles!appointments_doctor_id_fkey(full_name)")
    .eq("id", appointmentId)
    .maybeSingle();

  if (fetchError || !appointment) {
    return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
  }

  if (
    appointment.patient_id !== user.id &&
    appointment.doctor_id !== user.id
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  let roomName = appointment.daily_room_name as string | null;
  if (!roomName) {
    roomName = buildRoomName(appointmentId);
    const room = await getOrCreateRoom(roomName);
    await supabase
      .from("appointments")
      .update({
        daily_room_name: room.name,
        status: "in_progress",
      })
      .eq("id", appointmentId);
    roomName = room.name;

    const token = await createMeetingToken(
      room.name,
      profile?.role === "doctor"
        ? `Dr. ${profile.full_name}`
        : profile?.full_name ?? "Patient"
    );

    return NextResponse.json({ roomUrl: room.url, token });
  }

  const room = await getOrCreateRoom(roomName);
  const token = await createMeetingToken(
    roomName,
    profile?.role === "doctor"
      ? `Dr. ${profile?.full_name ?? "Doctor"}`
      : profile?.full_name ?? "Patient"
  );

  if (appointment.status === "scheduled") {
    await supabase
      .from("appointments")
      .update({ status: "in_progress" })
      .eq("id", appointmentId);
  }

  return NextResponse.json({ roomUrl: room.url, token });
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const APPOINTMENT_SELECT = `
  *,
  patient:profiles!appointments_patient_id_fkey(id, full_name, role, specialty),
  doctor:profiles!appointments_doctor_id_fkey(id, full_name, role, specialty)
`;

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const scope = searchParams.get("scope");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  let query = supabase
    .from("appointments")
    .select(APPOINTMENT_SELECT)
    .order("scheduled_at", { ascending: true });

  if (profile?.role === "doctor") {
    query = query.eq("doctor_id", user.id);
    if (scope === "today") {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      query = query
        .gte("scheduled_at", start.toISOString())
        .lte("scheduled_at", end.toISOString());
    }
  } else {
    query = query.eq("patient_id", user.id);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ appointments: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    doctorId?: string;
    scheduledAt?: string;
  };

  if (!body.doctorId || !body.scheduledAt) {
    return NextResponse.json(
      { error: "doctorId and scheduledAt required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("appointments")
    .insert({
      patient_id: user.id,
      doctor_id: body.doctorId,
      scheduled_at: body.scheduledAt,
      status: "scheduled",
    })
    .select(APPOINTMENT_SELECT)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ appointment: data });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    appointmentId?: string;
    status?: string;
    notes?: string;
    prescription?: {
      medication: string;
      dosage: string;
      instructions: string;
      patientId: string;
    };
  };

  if (!body.appointmentId) {
    return NextResponse.json({ error: "appointmentId required" }, { status: 400 });
  }

  const { data: appointment } = await supabase
    .from("appointments")
    .select("*")
    .eq("id", body.appointmentId)
    .maybeSingle();

  if (!appointment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (
    appointment.patient_id !== user.id &&
    appointment.doctor_id !== user.id
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updates: Record<string, string> = {};
  if (body.status) updates.status = body.status;
  if (body.notes !== undefined) updates.notes = body.notes;

  if (Object.keys(updates).length > 0) {
    const { error } = await supabase
      .from("appointments")
      .update(updates)
      .eq("id", body.appointmentId);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  if (body.prescription && appointment.doctor_id === user.id) {
    const { error: rxError } = await supabase.from("prescriptions").insert({
      appointment_id: body.appointmentId,
      patient_id: body.prescription.patientId,
      doctor_id: user.id,
      medication: body.prescription.medication,
      dosage: body.prescription.dosage,
      instructions: body.prescription.instructions,
    });

    if (rxError) {
      return NextResponse.json({ error: rxError.message }, { status: 500 });
    }

    if (body.notes) {
      await supabase.from("patient_records").insert({
        patient_id: body.prescription.patientId,
        record_type: "Visit summary",
        title: "Telehealth consultation",
        summary: body.notes,
      });
    }
  }

  return NextResponse.json({ ok: true });
}

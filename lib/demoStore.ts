import { cookies } from "next/headers";
import {
  DEMO_APPOINTMENTS,
  DEMO_DOCTOR,
  DEMO_DOCTOR_ID,
  DEMO_PATIENT,
  DEMO_PATIENT_ID,
  DEMO_PRESCRIPTIONS,
  DEMO_RECORDS,
  getDemoProfileById,
} from "@/lib/demoData";
import type {
  Appointment,
  PatientRecord,
  Prescription,
  Profile,
  UserRole,
} from "@/lib/types";

const STATE_COOKIE = "mc_demo_state";

interface DemoState {
  appointments: Appointment[];
  records: PatientRecord[];
  prescriptions: Prescription[];
}

function defaultState(): DemoState {
  return {
    appointments: DEMO_APPOINTMENTS.map((a) => ({ ...a })),
    records: DEMO_RECORDS.map((r) => ({ ...r })),
    prescriptions: DEMO_PRESCRIPTIONS.map((p) => ({ ...p })),
  };
}

async function readState(): Promise<DemoState> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(STATE_COOKIE)?.value;
  if (!raw) return defaultState();

  try {
    const parsed = JSON.parse(raw) as DemoState;
    return {
      appointments: parsed.appointments?.length
        ? parsed.appointments
        : defaultState().appointments,
      records: [...defaultState().records, ...(parsed.records ?? [])],
      prescriptions: parsed.prescriptions ?? [],
    };
  } catch {
    return defaultState();
  }
}

async function writeState(state: DemoState): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(STATE_COOKIE, JSON.stringify(state), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
}

function enrichAppointment(appt: Appointment): Appointment {
  return {
    ...appt,
    patient: getDemoProfileById(appt.patient_id) ?? undefined,
    doctor: getDemoProfileById(appt.doctor_id) ?? DEMO_DOCTOR,
  };
}

export async function getDemoDoctors(): Promise<Profile[]> {
  return [DEMO_DOCTOR];
}

export async function getDemoAppointments(role: UserRole): Promise<Appointment[]> {
  const state = await readState();
  const userId = role === "doctor" ? DEMO_DOCTOR_ID : DEMO_PATIENT_ID;

  return state.appointments
    .filter((a) =>
      role === "doctor" ? a.doctor_id === userId : a.patient_id === userId
    )
    .map(enrichAppointment)
    .sort(
      (a, b) =>
        new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
    );
}

export async function getDemoAppointment(
  id: string
): Promise<Appointment | null> {
  const state = await readState();
  const appt = state.appointments.find((a) => a.id === id);
  return appt ? enrichAppointment(appt) : null;
}

export async function createDemoAppointment(input: {
  doctorId: string;
  scheduledAt: string;
}): Promise<Appointment> {
  const state = await readState();
  const appt: Appointment = enrichAppointment({
    id: crypto.randomUUID(),
    patient_id: DEMO_PATIENT_ID,
    doctor_id: input.doctorId,
    scheduled_at: input.scheduledAt,
    status: "scheduled",
    daily_room_name: null,
    notes: null,
    created_at: new Date().toISOString(),
  });
  state.appointments.push(appt);
  await writeState(state);
  return appt;
}

export async function updateDemoAppointment(
  id: string,
  updates: Partial<Pick<Appointment, "status" | "notes" | "daily_room_name">>
): Promise<void> {
  const state = await readState();
  const idx = state.appointments.findIndex((a) => a.id === id);
  if (idx === -1) return;
  state.appointments[idx] = { ...state.appointments[idx], ...updates };
  await writeState(state);
}

export async function getDemoRecords(patientId: string): Promise<{
  records: PatientRecord[];
  prescriptions: Prescription[];
}> {
  const state = await readState();
  return {
    records: state.records.filter((r) => r.patient_id === patientId),
    prescriptions: state.prescriptions.filter((p) => p.patient_id === patientId),
  };
}

export async function addDemoPrescription(input: {
  appointmentId: string;
  patientId: string;
  medication: string;
  dosage: string;
  instructions: string;
  notes?: string;
}): Promise<void> {
  const state = await readState();
  state.prescriptions.push({
    id: crypto.randomUUID(),
    appointment_id: input.appointmentId,
    patient_id: input.patientId,
    doctor_id: DEMO_DOCTOR_ID,
    medication: input.medication,
    dosage: input.dosage,
    instructions: input.instructions,
    created_at: new Date().toISOString(),
  });

  if (input.notes) {
    state.records.push({
      id: crypto.randomUUID(),
      patient_id: input.patientId,
      record_type: "Visit summary",
      title: "Telehealth consultation",
      summary: input.notes,
      recorded_at: new Date().toISOString(),
    });
  }

  const idx = state.appointments.findIndex((a) => a.id === input.appointmentId);
  if (idx !== -1 && input.notes) {
    state.appointments[idx].notes = input.notes;
  }

  await writeState(state);
}

export { DEMO_PATIENT, DEMO_DOCTOR, DEMO_PATIENT_ID, DEMO_DOCTOR_ID };

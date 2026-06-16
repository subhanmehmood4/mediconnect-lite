import type {
  Appointment,
  PatientRecord,
  Prescription,
  Profile,
} from "@/lib/types";

export const DEMO_DOCTOR_ID = "00000000-0000-4000-a000-000000000001";
export const DEMO_PATIENT_ID = "00000000-0000-4000-a000-000000000002";
export const DEMO_PATIENT2_ID = "00000000-0000-4000-a000-000000000003";
export const DEMO_APPOINTMENT_ID = "00000000-0000-4000-a000-000000000010";
export const DEMO_APPOINTMENT2_ID = "00000000-0000-4000-a000-000000000011";

export const DEMO_DOCTOR: Profile = {
  id: DEMO_DOCTOR_ID,
  full_name: "Sarah Chen",
  role: "doctor",
  specialty: "General Practice",
  created_at: new Date().toISOString(),
};

export const DEMO_PATIENT: Profile = {
  id: DEMO_PATIENT_ID,
  full_name: "Alex Rivera",
  role: "patient",
  specialty: null,
  created_at: new Date().toISOString(),
};

export const DEMO_PATIENT2: Profile = {
  id: DEMO_PATIENT2_ID,
  full_name: "Jordan Lee",
  role: "patient",
  specialty: null,
  created_at: new Date().toISOString(),
};

function soon(hoursFromNow: number): string {
  return new Date(Date.now() + hoursFromNow * 60 * 60 * 1000).toISOString();
}

function tomorrowAt(hour: number): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

export const DEMO_APPOINTMENTS: Appointment[] = [
  {
    id: DEMO_APPOINTMENT_ID,
    patient_id: DEMO_PATIENT_ID,
    doctor_id: DEMO_DOCTOR_ID,
    scheduled_at: soon(1),
    status: "scheduled",
    daily_room_name: null,
    notes: null,
    created_at: new Date().toISOString(),
    patient: DEMO_PATIENT,
    doctor: DEMO_DOCTOR,
  },
  {
    id: DEMO_APPOINTMENT2_ID,
    patient_id: DEMO_PATIENT2_ID,
    doctor_id: DEMO_DOCTOR_ID,
    scheduled_at: tomorrowAt(10),
    status: "scheduled",
    daily_room_name: null,
    notes: null,
    created_at: new Date().toISOString(),
    patient: DEMO_PATIENT2,
    doctor: DEMO_DOCTOR,
  },
];

export const DEMO_RECORDS: PatientRecord[] = [
  {
    id: "00000000-0000-4000-a000-000000000020",
    patient_id: DEMO_PATIENT_ID,
    record_type: "Lab result",
    title: "Annual blood panel",
    summary:
      "All values within normal range. Cholesterol slightly elevated — lifestyle review recommended.",
    recorded_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: "00000000-0000-4000-a000-000000000021",
    patient_id: DEMO_PATIENT_ID,
    record_type: "Allergy",
    title: "Penicillin allergy",
    summary: "Documented mild rash reaction. Avoid penicillin-class antibiotics.",
    recorded_at: new Date(Date.now() - 180 * 86400000).toISOString(),
  },
];

export const DEMO_PRESCRIPTIONS: Prescription[] = [];

export function getDemoProfile(role: "patient" | "doctor"): Profile {
  return role === "doctor" ? DEMO_DOCTOR : DEMO_PATIENT;
}

export function getDemoProfileById(id: string): Profile | null {
  if (id === DEMO_DOCTOR_ID) return DEMO_DOCTOR;
  if (id === DEMO_PATIENT_ID) return DEMO_PATIENT;
  if (id === DEMO_PATIENT2_ID) return DEMO_PATIENT2;
  return null;
}

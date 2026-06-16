export type UserRole = "patient" | "doctor";

export type AppointmentStatus =
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  specialty: string | null;
  created_at: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  scheduled_at: string;
  status: AppointmentStatus;
  daily_room_name: string | null;
  notes: string | null;
  created_at: string;
  patient?: Profile;
  doctor?: Profile;
}

export interface PatientRecord {
  id: string;
  patient_id: string;
  record_type: string;
  title: string;
  summary: string;
  recorded_at: string;
}

export interface Prescription {
  id: string;
  appointment_id: string;
  patient_id: string;
  doctor_id: string;
  medication: string;
  dosage: string;
  instructions: string;
  created_at: string;
}

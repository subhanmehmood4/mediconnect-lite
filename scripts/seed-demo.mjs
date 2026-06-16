#!/usr/bin/env node
/**
 * Seeds MediConnect demo users, profiles, appointments, and records.
 * Requires SUPABASE_SERVICE_ROLE_KEY and demo env vars in .env.local
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnv() {
  const envPath = resolve(root, ".env.local");
  if (!existsSync(envPath)) {
    console.error("Missing .env.local — copy from .env.example first.");
    process.exit(1);
  }
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq);
    const val = trimmed.slice(eq + 1);
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const patientEmail = process.env.DEMO_PATIENT_EMAIL ?? "patient@mediconnect.demo";
const patientPassword = process.env.DEMO_PATIENT_PASSWORD ?? "demo-patient-123";
const doctorEmail = process.env.DEMO_DOCTOR_EMAIL ?? "doctor@mediconnect.demo";
const doctorPassword = process.env.DEMO_DOCTOR_PASSWORD ?? "demo-doctor-123";

if (!url || !serviceKey) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function ensureUser(email, password, meta) {
  const { data: list } = await admin.auth.admin.listUsers();
  const existing = list?.users?.find((u) => u.email === email);
  if (existing) {
    await admin.auth.admin.updateUserById(existing.id, {
      user_metadata: meta,
      password,
    });
    return existing.id;
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: meta,
  });

  if (error) throw error;
  return data.user.id;
}

async function upsertProfile(id, fullName, role, specialty = null) {
  const { error } = await admin.from("profiles").upsert(
    { id, full_name: fullName, role, specialty },
    { onConflict: "id" }
  );
  if (error) throw error;
}

async function main() {
  console.log("Seeding MediConnect demo data...");

  const doctorId = await ensureUser(doctorEmail, doctorPassword, {
    full_name: "Sarah Chen",
    role: "doctor",
  });
  const patientId = await ensureUser(patientEmail, patientPassword, {
    full_name: "Alex Rivera",
    role: "patient",
  });

  const patient2Email = "patient2@mediconnect.demo";
  const patient2Id = await ensureUser(patient2Email, "demo-patient2-123", {
    full_name: "Jordan Lee",
    role: "patient",
  });

  await upsertProfile(doctorId, "Sarah Chen", "doctor", "General Practice");
  await upsertProfile(patientId, "Alex Rivera", "patient");
  await upsertProfile(patient2Id, "Jordan Lee", "patient");

  const now = new Date();
  const in30 = new Date(now.getTime() + 30 * 60 * 1000);
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  await admin.from("appointments").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  const { error: apptError } = await admin.from("appointments").insert([
    {
      patient_id: patientId,
      doctor_id: doctorId,
      scheduled_at: in30.toISOString(),
      status: "scheduled",
      notes: null,
    },
    {
      patient_id: patient2Id,
      doctor_id: doctorId,
      scheduled_at: tomorrow.toISOString(),
      status: "scheduled",
      notes: null,
    },
  ]);

  if (apptError) throw apptError;

  await admin.from("patient_records").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  await admin.from("patient_records").insert([
    {
      patient_id: patientId,
      record_type: "Lab result",
      title: "Annual blood panel",
      summary: "All values within normal range. Cholesterol slightly elevated — lifestyle review recommended.",
    },
    {
      patient_id: patientId,
      record_type: "Allergy",
      title: "Penicillin allergy",
      summary: "Documented mild rash reaction. Avoid penicillin-class antibiotics.",
    },
  ]);

  console.log("Done.");
  console.log(`  Doctor:  ${doctorEmail} / ${doctorPassword}`);
  console.log(`  Patient: ${patientEmail} / ${patientPassword}`);
  console.log(`  Patient: ${patient2Email} / demo-patient2-123`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

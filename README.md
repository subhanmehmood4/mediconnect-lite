# MediConnect Lite

Telehealth SaaS demo for [DevAxon](https://www.devaxon.com) — appointment scheduling, patient portal, doctor dashboard, and real WebRTC video consultations via Daily.co.

**Live demo:** https://mediconnect-lite.vercel.app

## Features

- Role-based auth (patient + doctor demo login)
- Appointment booking with time slots
- Patient health records & prescriptions portal
- Doctor schedule dashboard + e-prescription workflow
- Real WebRTC video calls (Daily.co)

> Portfolio demo — not for real medical use. Not HIPAA-certified.

## Setup

```bash
cd mediconnect-lite
npm install
cp .env.example .env.local
```

### Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes (seed) | Service role for seed script |
| `DAILY_API_KEY` | Yes (video) | Daily.co REST API key |
| `DEMO_PATIENT_EMAIL` | Yes | Demo patient account email |
| `DEMO_PATIENT_PASSWORD` | Yes | Demo patient password |
| `DEMO_DOCTOR_EMAIL` | Yes | Demo doctor account email |
| `DEMO_DOCTOR_PASSWORD` | Yes | Demo doctor password |

### Supabase

1. Create a Supabase project
2. Run `supabase/schema.sql` in the SQL editor
3. Enable Email auth under Authentication → Providers
4. Seed demo data:

```bash
npm run seed
```

This creates demo patient/doctor accounts, profiles, sample appointments, and records.

### Daily.co

1. Create a free account at [daily.co](https://www.daily.co)
2. Copy your API key from the dashboard
3. Set `DAILY_API_KEY` in `.env.local`

### Run locally

```bash
npm run dev
```

Open http://localhost:3000 — use **Enter as Patient** and **Enter as Doctor** in two browser windows to test video calls.

## Deploy (Vercel)

```bash
npx vercel --prod
```

Set all environment variables in Vercel project settings, then redeploy.

## Demo walkthrough

1. **Patient window:** Login → Book visit → pick doctor + time near now
2. **Doctor window:** Login → see appointment on schedule → Start Consultation
3. **Both:** Join video room, allow camera/mic
4. **Doctor:** After call, open patient profile → save prescription
5. **Patient:** Check Records for new prescription and visit summary

## License

Internal DevAxon demo — not for redistribution.

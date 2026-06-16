-- MediConnect Lite schema
-- Run in Supabase SQL editor

create type user_role as enum ('patient', 'doctor');
create type appointment_status as enum ('scheduled', 'in_progress', 'completed', 'cancelled');

create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  role user_role not null default 'patient',
  specialty text,
  created_at timestamptz not null default now()
);

create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references profiles (id) on delete cascade,
  doctor_id uuid not null references profiles (id) on delete cascade,
  scheduled_at timestamptz not null,
  status appointment_status not null default 'scheduled',
  daily_room_name text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists patient_records (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references profiles (id) on delete cascade,
  record_type text not null,
  title text not null,
  summary text not null,
  recorded_at timestamptz not null default now()
);

create table if not exists prescriptions (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references appointments (id) on delete cascade,
  patient_id uuid not null references profiles (id) on delete cascade,
  doctor_id uuid not null references profiles (id) on delete cascade,
  medication text not null,
  dosage text not null,
  instructions text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_appointments_patient on appointments (patient_id);
create index if not exists idx_appointments_doctor on appointments (doctor_id);
create index if not exists idx_appointments_scheduled on appointments (scheduled_at);
create index if not exists idx_patient_records_patient on patient_records (patient_id);

alter table profiles enable row level security;
alter table appointments enable row level security;
alter table patient_records enable row level security;
alter table prescriptions enable row level security;

-- Profiles: read own; doctors read patients they have appointments with
create policy "profiles_select_own"
  on profiles for select
  using (auth.uid() = id);

create policy "profiles_select_doctor_patients"
  on profiles for select
  using (
    exists (
      select 1 from appointments a
      where a.doctor_id = auth.uid()
        and a.patient_id = profiles.id
    )
  );

create policy "profiles_select_all_doctors"
  on profiles for select
  using (role = 'doctor');

create policy "profiles_insert_own"
  on profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on profiles for update
  using (auth.uid() = id);

-- Appointments
create policy "appointments_select_patient"
  on appointments for select
  using (patient_id = auth.uid());

create policy "appointments_select_doctor"
  on appointments for select
  using (doctor_id = auth.uid());

create policy "appointments_insert_patient"
  on appointments for insert
  with check (patient_id = auth.uid());

create policy "appointments_update_participant"
  on appointments for update
  using (patient_id = auth.uid() or doctor_id = auth.uid());

-- Patient records
create policy "records_select_patient"
  on patient_records for select
  using (patient_id = auth.uid());

create policy "records_select_doctor"
  on patient_records for select
  using (
    exists (
      select 1 from appointments a
      where a.doctor_id = auth.uid()
        and a.patient_id = patient_records.patient_id
    )
  );

-- Prescriptions
create policy "prescriptions_select_patient"
  on prescriptions for select
  using (patient_id = auth.uid());

create policy "prescriptions_select_doctor"
  on prescriptions for select
  using (doctor_id = auth.uid());

create policy "prescriptions_insert_doctor"
  on prescriptions for insert
  with check (doctor_id = auth.uid());

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'patient')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

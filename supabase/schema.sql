-- ============================================================
-- SwasthLink — Supabase PostgreSQL Schema v2
-- Multi-hospital QR-based OPD queue management
-- Run this in the Supabase SQL Editor to initialise the DB.
-- ============================================================

-- ── hospitals ──────────────────────────────────────────────────────────
create table if not exists hospitals (
  id           uuid   primary key default gen_random_uuid(),
  slug         text   not null unique,
  name         text   not null,
  name_hi      text,
  city         text,
  helpdesk_phone text,
  logo_url     text,
  created_at   timestamptz not null default now()
);

alter table hospitals enable row level security;
create policy "hospitals: public read"  on hospitals for select using (true);
create policy "hospitals: admin insert" on hospitals for insert with check (auth.role() = 'authenticated');
create policy "hospitals: admin update" on hospitals for update using (auth.role() = 'authenticated');

-- Seed a default hospital for local development
insert into hospitals (slug, name, city, helpdesk_phone)
values ('dgh', 'District General Hospital', 'New Delhi', '1800-180-1104')
on conflict (slug) do nothing;

-- ── staff_users ────────────────────────────────────────────────────────
-- Doctors and admins for each hospital. Linked to Supabase auth.users when
-- Supabase Auth is used; works standalone with hashed_password in mock mode.
create table if not exists staff_users (
  id             uuid   primary key default gen_random_uuid(),
  hospital_id    uuid   not null references hospitals(id) on delete cascade,
  staff_id       text   not null,                -- login username e.g. "dr.sharma"
  name           text   not null,
  role           text   not null default 'doctor' check (role in ('doctor','admin','superadmin')),
  hashed_password text,                           -- bcrypt hash; null if using Supabase Auth
  supabase_uid   uuid   unique,                  -- links to auth.users(id)
  -- doctor-specific fields (null for admin/superadmin)
  -- FK to doctors added below after doctors table is created
  doctor_id      uuid,
  created_at     timestamptz not null default now(),
  unique (hospital_id, staff_id)
);

alter table staff_users enable row level security;
create policy "staff_users: self read"  on staff_users for select using (
  auth.uid() = supabase_uid or auth.role() = 'authenticated'
);
create policy "staff_users: admin insert" on staff_users for insert with check (auth.role() = 'authenticated');
create policy "staff_users: admin update" on staff_users for update using (auth.role() = 'authenticated');

-- ── accounts ──────────────────────────────────────────────────────────
-- Patient-side mobile accounts. Not hospital-scoped (a patient can visit multiple hospitals).
create table if not exists accounts (
  id         uuid primary key default gen_random_uuid(),
  mobile     text not null unique,
  created_at timestamptz not null default now()
);

alter table accounts enable row level security;
create policy "accounts: insert own"  on accounts for insert with check (true);
create policy "accounts: select own"  on accounts for select using (true);

-- ── patients ──────────────────────────────────────────────────────────
create table if not exists patients (
  id         uuid primary key default gen_random_uuid(),
  account_id uuid not null references accounts(id) on delete cascade,
  name       text        not null,
  age        smallint    not null check (age between 1 and 120),
  gender     char(1)     not null check (gender in ('M','F','O')),
  created_at timestamptz not null default now()
);

alter table patients enable row level security;
create policy "patients: insert own"  on patients for insert with check (true);
create policy "patients: select own"  on patients for select using (true);

-- ── departments ───────────────────────────────────────────────────────
create table if not exists departments (
  id          text primary key,
  hospital_id uuid references hospitals(id) on delete cascade,
  name        text not null,
  name_hi     text,
  icon        text,
  color       text,
  bg          text,
  sort_order  smallint default 0
);

-- Default departments for the seeded hospital
insert into departments (id, name, name_hi, sort_order) values
  ('general', 'General OPD',  'सामान्य ओपीडी', 1),
  ('ortho',   'Orthopedics',  'हड्डी रोग',     2),
  ('ent',     'ENT',          'कान-नाक-गला',   3),
  ('cardio',  'Cardiology',   'हृदय रोग',       4),
  ('skin',    'Dermatology',  'त्वचा रोग',      5)
on conflict (id) do nothing;

alter table departments enable row level security;
create policy "departments: public read" on departments for select using (true);
create policy "departments: admin write" on departments for all using (auth.role() = 'authenticated');

-- ── doctors ───────────────────────────────────────────────────────────
create table if not exists doctors (
  id            uuid   primary key default gen_random_uuid(),
  hospital_id   uuid   references hospitals(id) on delete cascade,
  name          text   not null,
  specialty     text,
  room          text,
  department_id text   references departments(id),
  status        text   not null default 'available' check (status in ('available','busy','paused')),
  created_at    timestamptz not null default now()
);

alter table doctors enable row level security;
create policy "doctors: public read"   on doctors for select using (true);
create policy "doctors: admin update"  on doctors for update using (auth.role() = 'authenticated');
create policy "doctors: admin insert"  on doctors for insert with check (auth.role() = 'authenticated');

-- Add FK from staff_users.doctor_id → doctors.id now that doctors exists
alter table staff_users
  add constraint staff_users_doctor_id_fkey
  foreign key (doctor_id) references doctors(id);

-- ── queues ────────────────────────────────────────────────────────────
create table if not exists queues (
  id             uuid   primary key default gen_random_uuid(),
  hospital_id    uuid   references hospitals(id) on delete cascade,
  doctor_id      uuid   not null references doctors(id) unique,
  current_token  int    not null default 0,
  is_paused      bool   not null default false,
  skipped_tokens int[]  not null default '{}',
  updated_at     timestamptz not null default now()
);

alter table queues enable row level security;
create policy "queues: public read"   on queues for select using (true);
create policy "queues: admin update"  on queues for update using (auth.role() = 'authenticated');
create policy "queues: admin insert"  on queues for insert with check (auth.role() = 'authenticated');

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists queues_updated_at on queues;
create trigger queues_updated_at
  before update on queues
  for each row execute function update_updated_at();

-- ── queue_entries ─────────────────────────────────────────────────────
create table if not exists queue_entries (
  id            uuid   primary key default gen_random_uuid(),
  hospital_id   uuid   references hospitals(id) on delete cascade,
  patient_id    uuid   not null references patients(id),
  queue_id      uuid   not null references queues(id),
  doctor_id     uuid   not null references doctors(id),
  department_id text   references departments(id),
  token_number  int    not null,
  token_label   text   not null,
  status        text   not null default 'waiting' check (status in ('waiting','serving','done','skipped')),
  created_at    timestamptz not null default now(),
  unique (queue_id, token_number)
);

alter table queue_entries enable row level security;
create policy "entries: patient insert"  on queue_entries for insert with check (true);
create policy "entries: patient read"    on queue_entries for select using (true);
create policy "entries: admin update"    on queue_entries for update using (auth.role() = 'authenticated');

-- Auto-assign incrementing token_number per queue
create or replace function assign_token_number()
returns trigger language plpgsql as $$
declare
  next_token  int;
  dept_prefix char(1);
begin
  select coalesce(max(token_number), 0) + 1
    into next_token
    from queue_entries
   where queue_id = new.queue_id;

  -- Derive prefix from department (first letter, uppercase)
  select upper(left(d.id, 1))
    into dept_prefix
    from doctors doc
    join departments d on d.id = doc.department_id
   where doc.id = new.doctor_id
   limit 1;

  if dept_prefix is null then dept_prefix := 'G'; end if;

  new.token_number := next_token;
  new.token_label  := dept_prefix || '-' || lpad(next_token::text, 3, '0');
  return new;
end;
$$;

drop trigger if exists queue_entries_token on queue_entries;
create trigger queue_entries_token
  before insert on queue_entries
  for each row execute function assign_token_number();

-- ── Enable Realtime ───────────────────────────────────────────────────
-- In the Supabase dashboard → Database → Replication, enable these tables:
-- alter publication supabase_realtime add table queues;
-- alter publication supabase_realtime add table queue_entries;

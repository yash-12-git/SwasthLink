-- ============================================================
-- SwasthLink — Supabase PostgreSQL Schema
-- Run this in the Supabase SQL Editor to initialise the DB.
-- ============================================================

-- Enable row-level security (applied per table below)
-- ============================================================

-- ── patients ──────────────────────────────────────────────────────────
create table if not exists patients (
  id         uuid primary key default gen_random_uuid(),
  name       text        not null,
  mobile     text        not null,
  age        smallint    not null check (age between 1 and 120),
  gender     char(1)     not null check (gender in ('M','F','O')),
  created_at timestamptz not null default now()
);

alter table patients enable row level security;
-- Patients can only see their own row; any anon user can insert.
create policy "patients: insert own"  on patients for insert with check (true);
create policy "patients: select own"  on patients for select using (true);

-- ── departments ───────────────────────────────────────────────────────
create table if not exists departments (
  id          text primary key,
  name        text not null,
  name_hi     text,
  icon        text,
  color       text,
  bg          text,
  sort_order  smallint default 0
);

insert into departments (id, name, name_hi, sort_order) values
  ('general', 'General OPD',  'सामान्य ओपीडी', 1),
  ('ortho',   'Orthopedics',  'हड्डी रोग',     2),
  ('ent',     'ENT',          'कान-नाक-गला',   3),
  ('cardio',  'Cardiology',   'हृदय रोग',       4),
  ('skin',    'Dermatology',  'त्वचा रोग',      5)
on conflict (id) do nothing;

alter table departments enable row level security;
create policy "departments: public read" on departments for select using (true);

-- ── doctors ───────────────────────────────────────────────────────────
create table if not exists doctors (
  id            uuid   primary key default gen_random_uuid(),
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

-- ── queues ────────────────────────────────────────────────────────────
create table if not exists queues (
  id            uuid   primary key default gen_random_uuid(),
  doctor_id     uuid   not null references doctors(id) unique,
  current_token int    not null default 0,
  is_paused     bool   not null default false,
  updated_at    timestamptz not null default now()
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
create trigger queues_updated_at
  before update on queues
  for each row execute function update_updated_at();

-- ── queue_entries ─────────────────────────────────────────────────────
create table if not exists queue_entries (
  id            uuid   primary key default gen_random_uuid(),
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
  next_token int;
  dept_prefix char(1);
begin
  select coalesce(max(token_number), 0) + 1
    into next_token
    from queue_entries
   where queue_id = new.queue_id;

  select upper(left(department_id, 1))
    into dept_prefix
    from queue_entries
   where queue_id = new.queue_id
   limit 1;

  if dept_prefix is null then
    dept_prefix := 'G';
  end if;

  new.token_number := next_token;
  new.token_label  := dept_prefix || '-' || lpad(next_token::text, 3, '0');
  return new;
end;
$$;

create trigger queue_entries_token
  before insert on queue_entries
  for each row execute function assign_token_number();

-- ── Enable Realtime ───────────────────────────────────────────────────
-- Run these in the Supabase dashboard → Database → Replication
-- or uncomment here if using the CLI:
--
-- alter publication supabase_realtime add table queues;
-- alter publication supabase_realtime add table queue_entries;

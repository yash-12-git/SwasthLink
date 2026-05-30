# Supabase Setup & Admin/Doctor Flow Guide

This guide covers everything you need to do to move from mock mode to a live Supabase database, and how to use the admin and doctor flows end-to-end.

---

## Step 1 — Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) → New project.
2. Choose a name (e.g. `swasthlink`), set a strong DB password, pick the closest region.
3. Wait for the project to finish provisioning (~2 min).

---

## Step 2 — Run the Schema

1. In the Supabase dashboard, go to **SQL Editor**.
2. Copy the entire contents of `supabase/schema.sql` and paste it in.
3. Click **Run**.

This creates the following tables:

| Table | Purpose |
|-------|---------|
| `hospitals` | One row per hospital (slug, name, helpdesk phone) |
| `staff_users` | Doctors and admins per hospital |
| `accounts` | Patient mobile accounts (not hospital-scoped) |
| `patients` | Family members linked to an account |
| `departments` | OPD departments (seeded with 5 defaults) |
| `doctors` | Doctor profiles linked to departments |
| `queues` | One queue per doctor (current token, pause state, skipped tokens) |
| `queue_entries` | Each patient join event (token auto-assigned by trigger) |

The schema also seeds:
- Hospital: `District General Hospital` (slug: `dgh`)
- Departments: General OPD, Orthopedics, ENT, Cardiology, Dermatology

---

## Step 3 — Add the Password Verification Function

The staff login uses `pgcrypto` to verify bcrypt passwords. Run this in the SQL Editor:

```sql
-- Enable pgcrypto extension (only needed once per project)
create extension if not exists pgcrypto;

-- Function used by staffService.ts to verify staff passwords
create or replace function verify_staff_password(p_staff_id text, p_password text)
returns boolean language plpgsql security definer as $$
declare
  stored_hash text;
begin
  select hashed_password into stored_hash
    from staff_users
   where staff_id = p_staff_id;

  if stored_hash is null then return false; end if;
  return (stored_hash = crypt(p_password, stored_hash));
end;
$$;
```

---

## Step 4 — Seed Doctors and Staff

Replace the example values with your actual hospital doctors. Run in SQL Editor:

```sql
-- Step 4a: Get the hospital ID
select id from hospitals where slug = 'dgh';
-- Copy the UUID returned — you'll use it as <HOSPITAL_UUID> below.

-- Step 4b: Insert doctors
insert into doctors (hospital_id, name, specialty, room, department_id, status) values
  ('<HOSPITAL_UUID>', 'Dr. A. Sharma', 'General Medicine', 'Room 4', 'general', 'available'),
  ('<HOSPITAL_UUID>', 'Dr. R. Verma',  'Orthopedics',      'Room 8', 'ortho',   'available'),
  ('<HOSPITAL_UUID>', 'Dr. S. Rao',    'ENT',              'Room 12','ent',     'available'),
  ('<HOSPITAL_UUID>', 'Dr. M. Gupta',  'Cardiology',       'Room 2', 'cardio',  'available');

-- Step 4c: Create one queue per doctor
insert into queues (hospital_id, doctor_id)
select '<HOSPITAL_UUID>', id from doctors where hospital_id = '<HOSPITAL_UUID>';

-- Step 4d: Get doctor IDs (you need these for Step 4e)
select id, name from doctors where hospital_id = '<HOSPITAL_UUID>';
-- Copy the UUIDs for each doctor.

-- Step 4e: Create staff_users (doctors)
-- Password 'password' hashed with bcrypt
insert into staff_users (hospital_id, staff_id, name, role, hashed_password, doctor_id) values
  ('<HOSPITAL_UUID>', 'dr.sharma', 'Dr. A. Sharma', 'doctor', crypt('password', gen_salt('bf')), '<DR_SHARMA_UUID>'),
  ('<HOSPITAL_UUID>', 'dr.verma',  'Dr. R. Verma',  'doctor', crypt('password', gen_salt('bf')), '<DR_VERMA_UUID>'),
  ('<HOSPITAL_UUID>', 'dr.rao',    'Dr. S. Rao',    'doctor', crypt('password', gen_salt('bf')), '<DR_RAO_UUID>'),
  ('<HOSPITAL_UUID>', 'dr.gupta',  'Dr. M. Gupta',  'doctor', crypt('password', gen_salt('bf')), '<DR_GUPTA_UUID>');

-- Step 4f: Create admin staff user (no doctor_id)
insert into staff_users (hospital_id, staff_id, name, role, hashed_password) values
  ('<HOSPITAL_UUID>', 'admin', 'Hospital Admin', 'admin', crypt('admin123', gen_salt('bf')));
```

---

## Step 5 — Enable Realtime

In the Supabase dashboard:

1. Go to **Database → Replication**.
2. Under "Source", click **0 tables** next to `supabase_realtime`.
3. Enable these two tables: `queues`, `queue_entries`.

Or run in SQL Editor:
```sql
alter publication supabase_realtime add table queues;
alter publication supabase_realtime add table queue_entries;
```

---

## Step 6 — Set Environment Variables

Create or update `.env.local` in the project root:

```bash
# Get these from Supabase dashboard → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>

# Get this from Settings → API → service_role key (NEVER commit this to git)
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# Optional: fallback helpdesk number if not set in DB
NEXT_PUBLIC_HELPDESK_PHONE=1800-180-1104
```

Restart the dev server after adding these: `npm run dev`.

---

## How to Run the Admin Flow

### Doctor Login & Queue Management

1. Open `http://localhost:3000/admin/login`
2. Enter doctor credentials (e.g. Staff ID: `dr.sharma`, Password: `password`)
3. You land on `/admin/dashboard` — the doctor queue dashboard.

**Dashboard layout:**
- Top stats bar: Seen Today / Waiting / Avg Wait / Queue Status
- Serving Hero (center): large token number, consult timer, patient name
- Upcoming list: next patients in queue with token labels
- Skipped strip: recalled skipped tokens appear here

**Actions:**
| Button | What it does |
|--------|-------------|
| Next Patient | Marks current as done, advances to next token |
| Skip | Moves next patient to the skipped list, advances token |
| Pause / Resume | Freezes the queue (Next Patient is disabled when paused) |
| Recall (in skipped strip) | Moves a skipped patient back to front of upcoming list |

**Mobile layout:** Skip and Call Next appear as a fixed bottom action bar.

**Doctor isolation:** Dr. Sharma cannot access Dr. Verma's queue. Each doctor only ever sees their own `queueId` from their session.

---

### Admin Login & Overview

1. Open `http://localhost:3000/admin/login`
2. Enter: Staff ID `admin`, Password `admin123`
3. You land on `/admin/overview` — all queues in a grid.

**Overview cards show per doctor:**
- Current token being served
- Number of patients waiting
- Pause/Resume button
- Department accent colour

**Summary chips** at the top: Doctors Active / Total in Queue / Paused Queues.

Auto-refreshes every 10 seconds.

---

### TV Display Board

Open `http://localhost:3000/admin/tv` on any screen in the waiting area.

- Full-screen dark board (`#0D1B2A` background)
- One panel per doctor with large token display (`clamp(56px, 8vw, 96px)`)
- Live clock (top right)
- "PAUSED" banner on paused queues
- Auto-refreshes every 8 seconds
- No login required

---

## Patient Flow (end-to-end reminder)

1. Patient scans QR code → lands on `/?h=dgh`
2. Tap "Get Token" → `/register` (enter mobile) → `/family` (select/add member)
3. `/department` → pick OPD → `/doctor/[deptId]` → pick doctor
4. Token assigned → `/confirm` shows token label + estimated wait
5. `/track` shows live position in queue (updates via Realtime)

---

## Checking Everything Works

```bash
# Run tests (all 17 should pass)
npm run test

# TypeScript check (should produce no output)
npm run type-check

# Production build (should complete with no errors)
npm run build

# Start dev server
npm run dev
```

---

## Common Issues

**"Invalid staff ID or password" even with correct credentials**
- In Supabase mode, make sure `verify_staff_password` function exists (Step 3).
- Confirm `SUPABASE_SERVICE_ROLE_KEY` is set and the server was restarted.

**Queue state not updating in real time**
- Confirm Realtime is enabled for `queues` and `queue_entries` tables (Step 5).
- In mock mode, polling every 5 s is the fallback — there will be a slight delay.

**Token numbers jump or are wrong**
- The `assign_token_number` trigger handles numbering automatically. Make sure the trigger was created by the schema run.
- Do not manually insert `token_number` — let the trigger do it.

**Admin can't see all queues**
- `getHospitalQueueOverview` uses the service-role client. If `SUPABASE_SERVICE_ROLE_KEY` is missing, the app falls back to mock data.
- In Supabase mode, verify all queues have the same `hospital_id` as the admin's account.

**"useSearchParams() should be wrapped in a suspense boundary"**
- Already fixed. The patient landing page (`src/app/page.tsx`) is wrapped in `<React.Suspense>`.

# SwasthLink — System Overview

QR-based OPD queue management for government hospitals. Patients scan a QR code at the hospital entrance, register once, and join a doctor's queue from their phone. Doctors manage their own queue on a dedicated dashboard. Admins see all queues at once.

---

## What We Built

### Phase 1 — Patient Flow
- Mobile-first PWA (390 px target, looks fine up to ~600 px)
- QR scan → hospital identified via `?h=slug` URL param
- One-time mobile registration → add family members → select patient → pick department → pick doctor → join queue → token confirmation → live tracking

### Phase 2 — Admin / Doctor Portal
- Staff login with role-based routing
- Doctor dashboard: manage own queue (call next, skip, recall skipped, pause)
- Admin overview: see all doctors' queues in a grid
- TV display board: full-screen dark board for waiting area screens
- Multi-hospital: each hospital operates independently via slug

---

## Architecture at a Glance

```
Browser (React / Next.js 15 App Router)
  └── Patient routes  /  /register  /department  /doctor/[id]  /confirm  /track
  └── Admin routes    /admin/login  /admin/dashboard  /admin/overview  /admin/tv

Server Actions ('use server')
  └── queueService.ts   — join queue, get live state (patient-facing)
  └── adminService.ts   — next / skip / pause / recall / overview (staff-facing)
  └── staffService.ts   — login authentication
  └── hospitalService.ts — resolve hospital by slug

State
  └── patientStore (Zustand + persist)  — account, family, selected patient, active entries, hospital
  └── adminStore   (Zustand + persist)  — staff session + current queue state

Data
  └── Mock mode (default, no env vars needed)  — in-memory objects in mockAdminData.ts
  └── Supabase mode (set env vars)             — PostgreSQL + Realtime
```

---

## Directory Structure

```
src/
  app/
    page.tsx                  Patient landing page (QR scan entry point)
    select-hospital/          Hospital picker (shown when no QR context)
    register/                 Mobile number + OTP registration
    family/                   Family member list / add
    department/               Department picker
    doctor/[deptId]/          Doctor picker (dynamic route)
    confirm/                  Token confirmation screen
    track/                    Live queue tracker (Realtime)
    help/                     Helpdesk info
    add-patient/              Add new family member
    admin/
      login/page.tsx          Staff login (split-panel desktop, full-screen mobile)
      layout.tsx              Auth guard + role guard + sidebar injection
      dashboard/page.tsx      Doctor queue dashboard
      overview/page.tsx       Admin all-queues overview
      tv/page.tsx             TV display board

  components/
    layout/
      MobileLayout.tsx        Flex column shell for patient pages
      PatientHeader.tsx       Top bar with hospital name + language toggle
      BottomNav.tsx           4-tab navigation bar
    ui/
      Button, Card, Pill, SectionLabel, Spinner, ...
    admin/
      AdminSidebar.tsx        232 px sidebar with nav + doctor profile card
      DoctorQueueDashboard.tsx  Full queue management UI (responsive)
      AdminOverview.tsx       Grid of all doctor queue cards
      TVDisplay.tsx           Full-screen dark queue board
    ErrorBoundary.tsx         React class error boundary (wraps entire app)

  lib/
    supabase.ts               Public Supabase client
    supabaseAdmin.ts          Service-role client (bypasses RLS)
    mockData.ts               Mock departments / doctors for patient flow
    mockAdminData.ts          Mock staff + queue states for admin flow
    rateLimit.ts              In-memory rate limiter (Map-based, 1 min window)

  services/
    queueService.ts           Patient queue operations + rate limiting
    adminService.ts           Doctor/admin queue operations
    staffService.ts           Staff login (mock + Supabase)
    hospitalService.ts        Hospital lookup by slug
    departmentService.ts      Department list + live overview

  hooks/
    useAdminQueue.ts          Queue state + Realtime subscription (or 5 s polling)
    useTranslation.ts         en/hi i18n

  store/
    patientStore.ts           Zustand patient session
    adminStore.ts             Zustand admin/doctor session

  types/
    hospital.ts, staff.ts, department.ts, patient.ts, queue.ts

  __tests__/
    lib/rateLimit.test.ts           4 tests
    services/adminService.test.ts  13 tests (incl. doctor isolation)

supabase/
  schema.sql    Full PostgreSQL schema v2 (run once in Supabase SQL Editor)
```

---

## Routes

| Path | Who uses it | Notes |
|------|-------------|-------|
| `/` | Patient | Landing, live queue overview, dept shortcuts |
| `/select-hospital` | Patient | Hospital picker (shown when no QR scan context) |
| `/register` | Patient | Mobile number → creates account |
| `/family` | Patient | Select or add family member |
| `/department` | Patient | Pick OPD department |
| `/doctor/[deptId]` | Patient | Pick doctor within department |
| `/confirm` | Patient | Token confirmation + estimated wait |
| `/track` | Patient | Live token tracker (Realtime) |
| `/help` | Patient | Helpdesk phone, FAQ |
| `/add-patient` | Patient | Add new family member |
| `/admin/login` | Staff | Credentials → role-based redirect |
| `/admin/dashboard` | Doctor | Own queue: call next, skip, pause |
| `/admin/overview` | Admin | All queues at a glance |
| `/admin/tv` | Public screen | Full-screen dark display board |

---

## Multi-Hospital Support

Every hospital has a `slug` (e.g. `dgh`, `aiims`). Data is isolated at every layer:

| Layer | How isolation is enforced |
|-------|--------------------------|
| DB (departments, doctors, queues) | `hospital_id` FK on every row |
| Patient API routes | `?h=slug` param → two-step lookup (slug → uuid → filter) |
| Patient store | `activeEntries: Record<hospitalId, Record<patientId, entry>>` — tokens at Hospital A are never visible on Hospital B |
| Queue join | `joinQueue` scopes the duplicate-check to the current `hospital_id` — a patient can hold one active token per hospital |
| Admin / doctor portal | `session.hospitalId` set at login from `staff_users`; all admin queries filter by it |

**Entry point flows:**

1. **QR scan (primary flow)** — Patient scans `https://app.example.com/?h=dgh` → `getHospitalBySlug('dgh')` → stored in `patientStore.hospital`. All subsequent API calls carry `?h=dgh`.

2. **Direct URL / first visit (no QR)** — If `patientStore.hospital.id` is empty, the landing page redirects to `/select-hospital` — a list of all hospitals. Patient taps their hospital → stored → proceeds to landing.

3. **Returning visit** — `hospital` is persisted in `localStorage` (`ht-patient-v3`). Next visit goes straight to landing with the previously selected hospital. QR scan always overrides the stored value.

**Printing QR codes:** Each hospital gets a unique URL: `https://app.example.com/?h=<slug>`. Use any QR generator. Laminate and place at the hospital entrance.

---

## Doctor Isolation

A doctor sees **only their own queue**. Here's how it's enforced:

1. At login, `staffService.loginStaff()` fetches the `queue_id` linked to that doctor from the DB and stores it in `StaffSession.queueId`.
2. The dashboard calls `useAdminQueue(session.queueId)` — queueId comes from the session, not from any URL param.
3. All `adminService` functions take a `queueId` parameter — the session queueId is the only valid value the doctor ever passes.
4. In Supabase mode, the service-role client enforces this at the DB layer; the doctor cannot call `getHospitalQueueOverview()` since that function is only called from the admin overview page (role-guarded by `layout.tsx`).

---

## Token Format

`PREFIX-NNN` where:
- `PREFIX` = first letter of the department ID, uppercased (General → `G`, Ortho → `O`, ENT → `E`, Cardiology → `C`)
- `NNN` = zero-padded token number (001, 002, … 999)

Examples: `G-011`, `O-006`, `E-004`, `C-009`

The token number is assigned by the `assign_token_number()` PostgreSQL trigger on insert to `queue_entries`.

---

## Mock Mode (default)

When `NEXT_PUBLIC_SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` are absent, the app runs entirely on in-memory data:

**Demo patients** — register any mobile number, all OTP codes are accepted.

**Demo staff credentials:**

| Staff ID | Password | Role | Department |
|----------|----------|------|------------|
| `dr.sharma` | `password` | Doctor | General OPD |
| `dr.verma` | `password` | Doctor | Orthopedics |
| `dr.rao` | `password` | Doctor | ENT (paused) |
| `dr.gupta` | `password` | Doctor | Cardiology |
| `admin` | `admin123` | Admin | All queues |

Queue state is held in `mockQueueStates` (module-level object). State **persists across server action calls** within a single dev-server session but **resets on server restart**.

---

## Rate Limiting

`src/lib/rateLimit.ts` — in-memory sliding-window counter.

| Action | Limit | Window |
|--------|-------|--------|
| `joinQueue` | 3 requests | 1 minute per key |
| default | 20 requests | 1 minute per key |

Key is `${ip}:${action}`. No external store required (resets on server restart).

---

## Error Handling

- **ErrorBoundary** (React class component) wraps the entire app in `layout.tsx`. Any unhandled render error shows a centered "Something went wrong" card with a Refresh button.
- **Rate limit errors** surface as user-visible toast/alert in the queue join flow.
- **Auth guard** in `/admin/layout.tsx` redirects unauthenticated visitors to `/admin/login` before any portal page renders.

---

## Tests (Vitest)

```
src/__tests__/lib/rateLimit.test.ts       — 4 tests
src/__tests__/services/adminService.test.ts — 13 tests
```

Run: `npm run test`
Watch: `npm run test:watch`

All 17 tests pass. TypeScript clean (`npm run type-check`). Production build clean (`npm run build`).

---

## Key Environment Variables

| Variable | Required for | Notes |
|----------|-------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase mode | Public — goes to browser |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase mode | Public — goes to browser |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin operations | **Server-only** — never expose to browser |
| `NEXT_PUBLIC_HELPDESK_PHONE` | Patient help page | Fallback if not set in DB |

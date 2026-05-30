# SwasthLink — Patient Flow Documentation

> Complete technical and UX documentation for the Phase 1 patient flow.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Architecture Diagram](#2-architecture-diagram)
3. [Patient Journey Map](#3-patient-journey-map)
4. [Screen-by-Screen Breakdown](#4-screen-by-screen-breakdown)
   - [1. QR Landing Page (`/`)](#screen-1--qr-landing-page-)
   - [2. Registration (`/register`)](#screen-2--registration-register)
   - [3. Department Selection (`/department`)](#screen-3--department-selection-department)
   - [4. Doctor Availability (`/doctor/[deptId]`)](#screen-4--doctor-availability-doctordeptid)
   - [5. Queue Confirmation (`/confirm`)](#screen-5--queue-confirmation-confirm)
   - [6. Live Queue Tracking (`/track`)](#screen-6--live-queue-tracking-track)
   - [7. Help & Support (`/help`)](#screen-7--help--support-help)
5. [State Management](#5-state-management)
6. [Realtime Engine](#6-realtime-engine)
7. [Multilingual System](#7-multilingual-system)
8. [Component Library](#8-component-library)
9. [Theme System](#9-theme-system)
10. [Data Layer](#10-data-layer)
11. [TypeScript Types](#11-typescript-types)
12. [Navigation & Routing](#12-navigation--routing)
13. [Mock Mode vs Supabase Mode](#13-mock-mode-vs-supabase-mode)

---

## 1. Overview

SwasthLink Phase 1 is a **mobile-first patient flow** that lets a patient:

1. Scan a QR code posted in the hospital OPD block
2. Register with minimal details (name, mobile, age, gender)
3. Pick their department and preferred doctor
4. Receive a numbered token instantly
5. Track their position in the queue live — without standing in line

The entire flow is designed to work on **low-end Android devices**, with large touch targets (≥ 48 px), high-contrast text, and bilingual labels (English + Hindi) throughout.

---

## 2. Architecture Diagram

```
Patient's Phone (Browser)
        │
        ▼
┌───────────────────────────────────────────────────┐
│   Next.js 15 App (Vercel / localhost:3000)        │
│                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │  Pages   │  │Components│  │  Hooks &     │   │
│  │ (App     │  │(Emotion  │  │  Stores      │   │
│  │ Router)  │  │  CSS)    │  │  (Zustand)   │   │
│  └────┬─────┘  └──────────┘  └──────┬───────┘   │
│       │                             │            │
│       ▼                             ▼            │
│  ┌───────────────────────────────────────────┐   │
│  │           Service Layer                   │   │
│  │  patientService.ts  │  queueService.ts    │   │
│  └────────────┬──────────────────────────────┘   │
└───────────────┼───────────────────────────────────┘
                │
        ┌───────┴──────────────┐
        │                      │
   Mock Mode               Supabase
(in-memory data)       ┌──────────────┐
                        │  PostgreSQL  │
                        │  Realtime    │
                        │  Auth        │
                        └──────────────┘
```

**Key principle:** The service layer checks `isSupabaseConfigured` at runtime. When Supabase credentials are absent, every operation falls back to in-memory mock data — the app is fully functional out of the box.

---

## 3. Patient Journey Map

```
[QR Scanned]
      │
      ▼
  / (Landing)
  ─ Hospital branding
  ─ Live queue overview
  ─ Departments grid
  ─ Help card
      │
      │ Tap "Get a Token"
      ▼
  /register
  ─ Name, Mobile, Age, Gender
  ─ Zod validation
      │
      │ Continue (valid form)
      ▼
  /department
  ─ All departments listed
  ─ Queue count + wait time per dept
      │
      │ Tap a department
      ▼
  /doctor/[deptId]
  ─ Doctors in that department
  ─ Status: Available / Busy / Paused
  ─ Queue count + estimated wait
      │
      │ Tap "Join Queue"
      │ (joinQueue() called → token issued)
      ▼
  /confirm
  ─ Big token number
  ─ Position + estimated wait
  ─ Doctor name + room
  ─ "You don't need to stand in line"
      │
      │ Tap "Track My Queue Live"
      ▼
  /track  ◄──────────────────────────────────┐
  ─ Hero: Your Token vs Now Serving           │
  ─ Real-time progress bar                    │
  ─ Upcoming tokens list                      │
  ─ Est. wait + Doctor status                 │
  ─ Auto-advances every ~9s (mock)            │
  ─ Supabase Realtime (when configured) ──────┘

  /help  (accessible from any screen via bottom nav)
  ─ Helpdesk phone number
  ─ OPD location
  ─ Re-scan QR
  ─ How it works guide
```

---

## 4. Screen-by-Screen Breakdown

---

### Screen 1 — QR Landing Page (`/`)

**File:** `src/app/page.tsx`

**Purpose:** Entry point after scanning the hospital's QR code. Gives the patient an immediate overview of what's happening and a clear single CTA.

#### Sections

| Section | Content | Source |
|---|---|---|
| PatientHeader | Hospital name, tagline, language toggle, notification bell | `PatientHeader.tsx` |
| Queue Banner | Shown only when patient has an active token — links to `/track` | `QueueWidget` (banner variant) |
| Hero Card | Welcome message + "Get a Token" button | Inline |
| Now Serving | Live G-xxx and C-xxx tokens for General OPD and Cardiology | Mock (will be Supabase Realtime) |
| Departments Grid | 5 departments + "More" → `/department` | `MOCK_DEPARTMENTS` |
| Help Card | Phone number + link to `/help` | Inline |
| BottomNav | Home / My Queue / Help | `BottomNav.tsx` |

#### State consumed
- `usePatientStore → activeEntry` — whether to show the queue banner
- `useQueueStore → live` — needed alongside `activeEntry` to show banner
- `useTranslation` — all visible strings

#### Navigation
- "Get a Token" → `/register`
- Department tap → `/register`
- "See all" → `/department`
- Help card → `/help`
- Bottom nav → `/track` (My Queue), `/help`

---

### Screen 2 — Registration (`/register`)

**File:** `src/app/register/page.tsx`

**Purpose:** Collect the minimum patient details required to issue a token. Designed for low-digital-literacy users with large inputs and simple labels.

#### Form Fields

| Field | Type | Validation |
|---|---|---|
| Full Name | Text | Required, min 2 chars |
| Mobile Number | Numeric (10-digit) | `/^\d{10}$/` — digits only, stripped on input |
| Age | Numeric | 1–120 |
| Gender | Segmented (F / M / O) | Required |

#### Libraries used
- **React Hook Form** — `useForm` with `zodResolver`
- **Zod** — schema built dynamically from `t()` so error messages are translated

#### State written
- `usePatientStore.setPatient({ name, mobile, age, gender })`

#### Key UX decisions
- `inputMode="numeric"` on mobile/age → numeric keyboard on Android
- `autoFocus` on name field
- Continue button disabled until form is valid
- Error messages appear below each field, translated

#### Navigation
- Back → `/` (BackBar)
- Continue (valid) → `/department`

---

### Screen 3 — Department Selection (`/department`)

**File:** `src/app/department/page.tsx`

**Purpose:** Show the patient all available departments so they can route themselves correctly.

#### Each card shows
- Department name (English + Hindi)
- Number of patients currently in queue
- Estimated wait time
- Left-border accent in the department's brand colour

#### Data source
`MOCK_DEPARTMENTS` from `src/lib/mockData.ts` — 5 departments:
- General OPD (`#1565C0`)
- Orthopedics (`#6A3FB8`)
- ENT (`#0E7C7B`)
- Cardiology (`#D32F2F`)
- Dermatology (`#ED6C02`)

#### State written
- `usePatientStore.setSelectedDept(dept)`

#### Navigation
- Back → `/register`
- Tap a department → `/doctor/[deptId]`

---

### Screen 4 — Doctor Availability (`/doctor/[deptId]`)

**File:** `src/app/doctor/[deptId]/page.tsx`

**Purpose:** Show the doctors available in the chosen department, with real-time status and queue info.

#### Dynamic route
`deptId` is the department `id` string (e.g. `general`, `cardio`). Used to look up doctors from `MOCK_DOCTORS[deptId]`.

#### Each DoctorCard shows

| Element | Description |
|---|---|
| Avatar | Generated from initials (e.g. "Dr. A. Sharma" → "AS") |
| Name + Specialty + Room | From doctor record |
| Status Badge | Available (green pulse) / Busy (amber) / Paused (red) |
| Queue Count | Integer — patients waiting |
| Estimated Wait | `~20m` or `—` if paused |
| Join Queue button | Primary when available, ghost+disabled when paused |

#### Join Queue flow
When "Join Queue" is tapped:

```
1. setLoading(true)
2. setSelectedDoctor(doc)
3. joinQueue({ patientId, doctorId, departmentId, ... })
   └─ Mock: returns { token_number: 47, token_label: "G-047", ... }
   └─ Supabase: inserts queue_entry, DB trigger assigns token_number
4. setActiveEntry(entry)
5. buildMockLiveQueue(...) → useQueueStore.setLive(live)
6. router.push('/confirm')
```

#### State written
- `usePatientStore.setSelectedDoctor(doc)`
- `usePatientStore.setActiveEntry(entry)`
- `useQueueStore.setLive(liveQueueState)`

#### Navigation
- Back → `/department`
- Successful join → `/confirm`

---

### Screen 5 — Queue Confirmation (`/confirm`)

**File:** `src/app/confirm/page.tsx`

**Purpose:** Reassure the patient that they are in the queue and show them their token number clearly.

#### Layout
- **Success hero** — green gradient, animated ring, "You're in the queue!"
- **Token card** — overlaps the hero by `-48px` margin-top, creating a floating card effect
  - Large token number (64px, tabular-nums)
  - Patient name + age
  - Position ahead + estimated wait (from `useQueueStore`)
  - Doctor info row with avatar + Available badge
- **Relax info alert** — blue info box: "You don't need to stand in line"
- **Track button** → `/track`
- **Back to Home** → `/`

#### Guard
If `activeEntry` is null (patient navigated here directly without a token), shows a fallback with "No active token" + home link.

#### State consumed
- `usePatientStore → { activeEntry, patient, selectedDoctor, selectedDept }`
- `useQueueStore → { patientsAhead(), estimatedWait() }`

---

### Screen 6 — Live Queue Tracking (`/track`)

**File:** `src/app/track/page.tsx`  
**Component:** `src/components/patient/LiveTracker.tsx`

**Purpose:** The most important patient screen. Communicates live queue position without any ambiguity.

#### Top bar (sticky)
- Back arrow → `/`
- Department + Doctor name
- "Live" green pill

#### LiveTracker component sections

##### Hero card
- **Your Token** — large (56px), top-left
- **Now Serving** — smaller (34px), top-right, with animated white pulse dot
- **Status box** — shows one of three states:
  - `isYou` (serving ≥ yourToken): "It's your turn! Please go to Room X →" — green gradient
  - `isNear` (≤ 2 ahead): "Almost your turn — please come near the room"
  - Otherwise: "You can relax — no need to stand in line" + patients ahead count

##### Progress bar
- Tracks how far `currentToken` has advanced toward `yourToken`
- Animated fill via CSS transition (0.7s cubic-bezier)
- Labels: `G-042 now` ← → `G-047 you`

##### Est. wait + Doctor status (side by side)
- Wait tile: big amber number, `~4 min / patient` sub
- Doctor tile: StatusBadge (Available/Paused), "last call Xs ago" updated every second

##### Upcoming tokens list
- Scrollable list of next 6 tokens
- Patient's row highlighted in primary-50 blue
- "next" amber pill on first, "your turn" primary pill on patient's row, `#N` on others

##### Realtime
`useRealtimeQueue(live?.queueId)` — subscribes to Supabase `queues` table via Realtime channel.  
In mock mode: `setInterval` advances `currentToken` every 9 seconds (stops when within 3 of `yourToken`).

#### State consumed
- `useQueueStore → { live, patientsAhead(), estimatedWait(), progressPct() }`
- `usePatientStore → { selectedDept, selectedDoctor }`
- Internal: `useReducer` tick every 1000ms to update "last call Xs ago"

---

### Screen 7 — Help & Support (`/help`)

**File:** `src/app/help/page.tsx`

**Purpose:** Provide multiple assistance channels for non-technical patients, elderly users, and first-time visitors.

#### Help items

| Item | Icon | Action |
|---|---|---|
| Call Help Desk | Phone (green) | Toll-free number from `NEXT_PUBLIC_HELPDESK_PHONE` |
| Find OPD Block | MapPin (blue) | "Ground floor, Gate 2" |
| Re-scan QR | QrCode (purple) | "Lost your token? Scan again" |
| How it works | Info (amber) | "Watch a 1-minute guide" |

#### Staff note card
Blue info box at the bottom reminding that staff are available at every help desk for elderly and first-time patients.

---

## 5. State Management

### `patientStore` (`src/store/patientStore.ts`)

Zustand store with `persist` middleware. Persists only `locale` and `activeEntry` to `localStorage` (key: `ht-patient`).

| State key | Type | Description |
|---|---|---|
| `locale` | `'en' \| 'hi'` | Current UI language |
| `patient` | `Partial<Patient>` | Registration form data |
| `selectedDept` | `Department \| null` | Chosen department |
| `selectedDoctor` | `Doctor \| null` | Chosen doctor |
| `activeEntry` | `QueueEntry \| null` | Issued token (persisted) |

**Why persist `activeEntry`?** — If the patient closes the browser and comes back, they can still navigate to `/track` and see their queue status without re-registering.

**What is NOT persisted** — `patient` form data, `selectedDept`, `selectedDoctor`. These are in-session only and reset on store rehydration.

### `queueStore` (`src/store/queueStore.ts`)

Zustand store without persistence (queue state is live and always fetched fresh).

| State key / Method | Description |
|---|---|
| `live` | Full `LiveQueueState` object |
| `setLive(state)` | Set complete live state |
| `patchLive(patch)` | Partial update (used by realtime) |
| `patientsAhead()` | Derived: index of patient's token in `upcomingTokens` |
| `estimatedWait()` | `patientsAhead() × avgMinsPerPatient` |
| `progressPct()` | How far current token has moved toward patient's token (0–100) |

---

## 6. Realtime Engine

### Hook: `useRealtimeQueue` (`src/hooks/useQueue.ts`)

Called from `LiveTracker.tsx` with the `queueId`.

#### Mock mode (default)
```
setInterval (every 1000ms)
  ├─ Check: auto should run?
  │    → queue not paused
  │    → currentToken < yourToken - 3  (keep 3 ahead as buffer)
  └─ If yes: patchLive({ currentToken: n+1, ... })
```

The 3-token buffer ensures the "you don't need to stand in line" narrative never breaks mid-demo.

#### Supabase Realtime mode
```
supabase.channel('queue:<queueId>')
  .on('postgres_changes', {
    event: 'UPDATE',
    table: 'queues',
    filter: 'id=eq.<queueId>'
  }, (payload) => {
    patchLive({
      currentToken: payload.new.current_token,
      doctorStatus: payload.new.is_paused ? 'paused' : 'available',
      lastCallAt:   new Date(payload.new.updated_at).getTime()
    });
  })
  .subscribe();
```

Cleanup: channel is removed on component unmount.

---

## 7. Multilingual System

### Files
- `src/locales/en.ts` — English strings
- `src/locales/hi.ts` — Hindi strings (full parity with English)
- `src/lib/i18n.ts` — Locale registry + `interpolate()` helper
- `src/hooks/useTranslation.ts` — `useTranslation()` hook

### How it works

```typescript
// In any client component:
const { t, locale } = useTranslation();
t('register.title')                    // "Your Details"
t('department.wait', { mins: 22 })     // "~22 min"
```

The `t()` function:
1. Reads `locale` from `usePatientStore`
2. Does dot-path lookup in the locale dict: `'register.title'` → `dict.register.title`
3. Runs `interpolate()` to replace `{{vars}}`
4. Falls back to the key string if not found

### Language toggle
The `PatientHeader` component renders a pill button (`हिंदी` / `EN`) that calls `setLocale()`. Because all components subscribe to `usePatientStore`, the UI re-renders instantly everywhere.

### Adding a new language
1. Copy `src/locales/en.ts` → e.g. `src/locales/mr.ts`
2. Translate all string values
3. In `src/lib/i18n.ts`:
   ```typescript
   import mr from '@/locales/mr';
   export const locales = { en, hi, mr };
   export const supportedLocales: Locale[] = ['en', 'hi', 'mr'];
   ```
4. The toggle button can be updated in `PatientHeader.tsx` to cycle through all locales.

---

## 8. Component Library

### UI Primitives (`src/components/ui/`)

| Component | File | Description |
|---|---|---|
| `Button` | `Button.tsx` | Emotion styled — variants: primary, success, danger, warning, secondary, ghost. Sizes: sm, md, lg. |
| `Card` | `Card.tsx` | White surface with shadow, hover lift, optional left-border accent. |
| `Field` / `SegmentedField` | `Field.tsx` | Controlled text input with focus ring. Segmented for gender picker. |
| `StatusBadge` | `StatusBadge.tsx` | Coloured pill with animated dot. Statuses: available, busy, paused, serving, waiting, done, skipped. |
| `Pill` | `Pill.tsx` | Small inline tag. Accepts custom bg/color. |
| `ProgressBar` | `ProgressBar.tsx` | Animated fill bar, 0–100 value. |
| `TokenDisplay` | `TokenDisplay.tsx` | Large token number tile. Tones: primary, success, ink, white. Sizes: sm, md, lg, xl. |
| `Alert` | `Alert.tsx` | Inline alert box. Variants: info, success, warning, danger. |
| `Avatar` | `Avatar.tsx` | Circle with generated initials (strips "Dr." prefix). |
| `SectionLabel` | `SectionLabel.tsx` | Uppercase section header with optional right action. |

### Layout Components (`src/components/layout/`)

| Component | Description |
|---|---|
| `MobileLayout` | `min-height: 100dvh` flex column. Font and antialiasing applied. |
| `PatientHeader` | Blue gradient header with hospital branding, language toggle, notification bell. |
| `BackBar` | Sticky white top bar with back arrow (Next.js `Link`), title, subtitle, optional step pill. |
| `BottomNav` | Fixed bottom tab bar — Home, My Queue (with green dot when token active), Help. |

### Patient Components (`src/components/patient/`)

| Component | Description |
|---|---|
| `DepartmentCard` | Full-width clickable card showing dept name + Hindi name + queue stats. Accent border uses dept colour. |
| `DoctorCard` | Doctor info, status badge, stats grid, Join Queue CTA. Disabled state for paused queues. |
| `QueueWidget` | `card` variant: standalone tracking card. `banner` variant: compact blue strip for landing page. |
| `LiveTracker` | Full live queue tracking UI with hero, progress bar, wait tiles, upcoming list. |

---

## 9. Theme System

### Files
```
src/theme/
├── colors.ts      — all colour tokens
├── spacing.ts     — spacing scale + radius + min touch target
├── typography.ts  — font family, weights, sizes, line heights
├── shadows.ts     — sm / md / lg / up shadow values
└── index.ts       — re-exports + combined theme object
```

### Color Palette

| Token | Value | Use |
|---|---|---|
| `primary` | `#1565C0` | CTAs, links, active states |
| `primaryDark` | `#0D47A1` | Hover state, hero gradients |
| `primary50` | `#E3F2FD` | Highlight backgrounds |
| `success` | `#2E7D32` | Available status, confirm hero |
| `warning` | `#ED6C02` | Busy status, wait time |
| `danger` | `#D32F2F` | Paused status, errors |
| `bg` | `#F7F9FC` | Page background |
| `surface` | `#FFFFFF` | Cards |
| `surface2` | `#F1F5FA` | Input backgrounds, sub-tiles |
| `ink` | `#16202E` | Headings |
| `ink700` | `#34465B` | Body text |
| `ink500` | `#5E7186` | Muted labels |
| `ink400` | `#8A9AAC` | Placeholders, icons |

### Typography
Font: **Plus Jakarta Sans** (Google Fonts) — 400, 500, 600, 700, 800

### Spacing
8-point grid: `4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64 px`

Minimum touch target: `48px` (WCAG 2.5.5 compliant)

---

## 10. Data Layer

### Mock Data (`src/lib/mockData.ts`)

Used when `NEXT_PUBLIC_USE_MOCK_DATA=true` (or Supabase is not configured).

- `MOCK_DEPARTMENTS` — 5 departments with queue counts and wait times
- `MOCK_DOCTORS` — per-department doctor arrays with status, queue count, wait
- `buildMockLiveQueue()` — constructs a full `LiveQueueState` with upcoming tokens pre-populated around the patient's token number
- `fmtToken(prefix, n)` — formats `47` → `G-047`

### Services

#### `patientService.ts`
```typescript
createPatient(input: PatientInput): Promise<Patient>
```
- Mock: returns `{ id: 'mock-patient-XXXX', ...input }`
- Supabase: `INSERT INTO patients (...) RETURNING *`

#### `queueService.ts`
```typescript
joinQueue(input: JoinQueueInput): Promise<QueueEntry>
getLiveQueueState(queueId, yourToken, ...): Promise<LiveQueueState>
```
- `joinQueue` mock: returns a fake entry with incrementing token number
- `joinQueue` Supabase: upserts queue row, inserts queue_entry (DB trigger assigns token)
- `getLiveQueueState` Supabase: fetches queue + all waiting entries, computes upcoming list

---

## 11. TypeScript Types

### `src/types/patient.ts`
```typescript
type Gender = 'M' | 'F' | 'O';
interface Patient { id, name, mobile, age, gender, created_at? }
type PatientInput = Omit<Patient, 'id' | 'created_at'>
```

### `src/types/department.ts`
```typescript
interface Department {
  id, name, nameHi, icon, color, bg,
  activeQueue?,   // patients waiting now
  avgWaitMins?    // estimated minutes
}
```

### `src/types/doctor.ts`
```typescript
type DoctorStatus = 'available' | 'busy' | 'paused';
interface Doctor {
  id, name, specialty, room, department_id, status,
  queue_count, avg_wait_mins, synced?
}
```

### `src/types/queue.ts`
```typescript
type QueueEntryStatus = 'waiting' | 'serving' | 'done' | 'skipped';

interface Queue { id, doctor_id, current_token, is_paused, updated_at }

interface QueueEntry {
  id, patient_id, queue_id, doctor_id, department_id,
  token_number, token_label, status, created_at
}

interface LiveQueueState {
  queueId, doctorId, doctorName, departmentName, room,
  currentToken, currentTokenLabel,
  yourToken, yourTokenLabel,
  doctorStatus, avgMinsPerPatient, lastCallAt,
  upcomingTokens: UpcomingToken[]
}

interface UpcomingToken { token, label, isYou }
```

---

## 12. Navigation & Routing

All navigation is Next.js App Router `Link` or `useRouter().push()`.

```
/                    page.tsx                  — Landing
/register            register/page.tsx         — Registration
/department          department/page.tsx        — Department list
/doctor/[deptId]     doctor/[deptId]/page.tsx  — Doctor list (dynamic)
/confirm             confirm/page.tsx           — Token confirmation
/track               track/page.tsx             — Live tracking
/help                help/page.tsx              — Help
```

**`/doctor/[deptId]`** is the only dynamic route. `deptId` is the department `id` string (e.g. `general`, `ortho`). It controls which doctor list is shown.

### Bottom Nav active states
- `/` → Home tab active
- `/track` → My Queue tab active + green dot when `activeEntry` exists
- `/help` → Help tab active

---

## 13. Mock Mode vs Supabase Mode

| Feature | Mock Mode | Supabase Mode |
|---|---|---|
| Patient creation | In-memory, incrementing ID | `INSERT INTO patients` |
| Token issuance | Incrementing counter starting at 47 | DB trigger assigns token_number |
| Live queue state | Pre-built `buildMockLiveQueue()` | Fetched from `queues` + `queue_entries` |
| Realtime updates | `setInterval` every 9s | Supabase Realtime `postgres_changes` |
| Data persistence | Lost on page refresh | Persisted in PostgreSQL |
| Setup required | None | Supabase project + schema.sql |

**Switching modes:** Set `NEXT_PUBLIC_USE_MOCK_DATA=false` in `.env.local` after configuring Supabase credentials. See [SETUP.md](./SETUP.md) for the full guide.

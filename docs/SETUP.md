# HospiTesch — Setup & Deployment Guide

> Step-by-step guide to run the project locally, connect Supabase, and deploy to Vercel.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Local Development (Mock Mode)](#2-local-development-mock-mode)
3. [Project Structure at a Glance](#3-project-structure-at-a-glance)
4. [Environment Variables Reference](#4-environment-variables-reference)
5. [Connecting Supabase](#5-connecting-supabase)
   - [5.1 Create a Supabase Project](#51-create-a-supabase-project)
   - [5.2 Run the Schema](#52-run-the-schema)
   - [5.3 Enable Realtime](#53-enable-realtime)
   - [5.4 Configure Row Level Security](#54-configure-row-level-security)
   - [5.5 Wire credentials into `.env.local`](#55-wire-credentials-into-envlocal)
   - [5.6 Verify the connection](#56-verify-the-connection)
6. [Seed Data (Optional)](#6-seed-data-optional)
7. [Deploying to Vercel](#7-deploying-to-vercel)
8. [Customising the Hospital Brand](#8-customising-the-hospital-brand)
9. [Adding a Language](#9-adding-a-language)
10. [Common Errors & Fixes](#10-common-errors--fixes)
11. [npm Scripts Reference](#11-npm-scripts-reference)

---

## 1. Prerequisites

| Tool | Minimum version | Check |
|---|---|---|
| Node.js | 18.17+ | `node -v` |
| npm | 9+ | `npm -v` |
| Git | any | `git --version` |
| A browser | Chrome / Firefox / Safari | — |

You do **not** need Supabase, Docker, or any database to run locally in mock mode.

---

## 2. Local Development (Mock Mode)

Mock mode uses in-memory data. No Supabase account needed. This is the fastest way to start.

### Step 1 — Clone / open the project

```bash
# If you cloned from GitHub:
git clone <your-repo-url>
cd hospitesch

# OR navigate to the existing folder:
cd ~/Desktop/hospitesch
```

### Step 2 — Install dependencies

```bash
npm install
```

This installs all packages listed in `package.json` (~350 MB in `node_modules`).

### Step 3 — Copy environment file

```bash
cp .env.example .env.local
```

The `.env.local` file already ships with mock mode enabled:

```env
NEXT_PUBLIC_USE_MOCK_DATA=true
NEXT_PUBLIC_HOSPITAL_NAME="District General Hospital"
NEXT_PUBLIC_HOSPITAL_TAGLINE="Govt. of India · जिला अस्पताल"
NEXT_PUBLIC_HELPDESK_PHONE=1800-180-1104
```

Leave `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` empty for now.

### Step 4 — Start the dev server

```bash
npm run dev
```

Output:
```
▲ Next.js 15.1.3
- Local:        http://localhost:3000
- Environments: .env.local
✓ Ready in 1.4s
```

### Step 5 — Open in browser

Navigate to **http://localhost:3000**

You should see the HospiTesch landing page. The full patient flow works in mock mode:

```
/ → /register → /department → /doctor/general → /confirm → /track
```

> **Tip:** Open DevTools → Toggle device toolbar → select a mid-range Android phone size (e.g. 390×844) to see the mobile layout as intended.

---

## 3. Project Structure at a Glance

```
hospitesch/
├── docs/
│   ├── FLOW.md          ← Patient flow documentation (this project)
│   └── SETUP.md         ← This file
├── public/
│   ├── favicon.svg
│   └── manifest.json    ← PWA manifest
├── src/
│   ├── app/             ← Next.js App Router pages
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   ├── page.tsx               ─ /  (QR Landing)
│   │   ├── register/page.tsx      ─ /register
│   │   ├── department/page.tsx    ─ /department
│   │   ├── doctor/[deptId]/page.tsx  ─ /doctor/:id
│   │   ├── confirm/page.tsx       ─ /confirm
│   │   ├── track/page.tsx         ─ /track
│   │   └── help/page.tsx          ─ /help
│   ├── components/
│   │   ├── ui/          ← Primitives (Button, Card, Field, Badge…)
│   │   ├── layout/      ← PatientHeader, BackBar, BottomNav, MobileLayout
│   │   └── patient/     ← DepartmentCard, DoctorCard, LiveTracker, QueueWidget
│   ├── hooks/
│   │   ├── useTranslation.ts      ─ i18n hook
│   │   └── useQueue.ts            ─ Realtime subscription
│   ├── lib/
│   │   ├── EmotionRegistry.tsx    ─ SSR Emotion cache
│   │   ├── i18n.ts                ─ Locale registry
│   │   ├── mockData.ts            ─ In-memory data
│   │   └── supabase.ts            ─ Lazy Supabase client
│   ├── locales/
│   │   ├── en.ts                  ─ English strings
│   │   └── hi.ts                  ─ Hindi strings
│   ├── services/
│   │   ├── patientService.ts      ─ create patient
│   │   └── queueService.ts        ─ join queue, get live state
│   ├── store/
│   │   ├── patientStore.ts        ─ Zustand: patient + locale
│   │   └── queueStore.ts          ─ Zustand: live queue state
│   ├── theme/                     ─ colors, spacing, typography, shadows
│   ├── types/                     ─ TypeScript interfaces
│   └── utils/format.ts            ─ fmtToken, fmtWait, secsSince
├── supabase/
│   └── schema.sql       ← Full PostgreSQL schema + RLS policies
├── .env.example         ← Template for environment variables
├── .env.local           ← Your actual env (git-ignored)
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

## 4. Environment Variables Reference

| Variable | Required | Default | Description |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | For Supabase mode | `""` | Your Supabase project URL (e.g. `https://xyz.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | For Supabase mode | `""` | Supabase anon/public key |
| `NEXT_PUBLIC_USE_MOCK_DATA` | No | `true` | `true` = use in-memory mock data; `false` = use Supabase |
| `NEXT_PUBLIC_APP_URL` | No | `http://localhost:3000` | Public URL of the app (used in links, QR codes) |
| `NEXT_PUBLIC_HOSPITAL_NAME` | No | `District General Hospital` | Shown in the header |
| `NEXT_PUBLIC_HOSPITAL_TAGLINE` | No | `Govt. of India · जिला अस्पताल` | Shown below the hospital name |
| `NEXT_PUBLIC_HELPDESK_PHONE` | No | `1800-180-1104` | Shown on landing + help pages |

> All variables are prefixed `NEXT_PUBLIC_` because they are read client-side. **Never put secrets in `NEXT_PUBLIC_` variables.**

---

## 5. Connecting Supabase

### 5.1 Create a Supabase Project

1. Go to **https://supabase.com** and sign in (free tier is sufficient for MVP)
2. Click **New project**
3. Fill in:
   - **Name:** `hospitesch` (or any name)
   - **Database password:** use a strong password and save it somewhere safe
   - **Region:** choose the closest to your hospital location (India → Singapore or Mumbai)
4. Click **Create new project** and wait ~1 minute for provisioning

### 5.2 Run the Schema

1. In your Supabase dashboard, click **SQL Editor** in the left sidebar
2. Click **New query**
3. Open the file `supabase/schema.sql` from this project
4. Copy the entire contents and paste into the SQL Editor
5. Click **Run** (or `Ctrl+Enter`)

You should see:

```
Success. No rows returned.
```

This creates the following tables:
- `patients` — stores patient registration data
- `departments` — static list of hospital departments
- `doctors` — doctors with their status
- `queues` — one queue per doctor (current token, pause state)
- `queue_entries` — individual token records with status

It also creates:
- A `assign_token_number()` trigger — automatically assigns the next sequential token number when a patient joins a queue
- An `update_updated_at()` trigger — keeps `queues.updated_at` fresh for realtime events
- Row Level Security (RLS) policies — patients can register and join queues; only authenticated doctors can update queue state

### 5.3 Enable Realtime

The live queue tracking screen uses Supabase Realtime to push updates instantly.

**Method A — Dashboard (recommended)**

1. In the Supabase dashboard, go to **Database → Replication**
2. Under **Tables in public schema**, find `queues` → toggle **Enabled**
3. Repeat for `queue_entries`

**Method B — SQL**

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE queues;
ALTER PUBLICATION supabase_realtime ADD TABLE queue_entries;
```

Run this in the SQL Editor. You should see `Success`.

### 5.4 Configure Row Level Security

RLS is already configured in `schema.sql`. Here's a summary of what's in place:

| Table | Anonymous can | Authenticated can |
|---|---|---|
| `patients` | INSERT, SELECT | INSERT, SELECT |
| `departments` | SELECT | SELECT |
| `doctors` | SELECT | SELECT, UPDATE |
| `queues` | SELECT | SELECT, INSERT, UPDATE |
| `queue_entries` | INSERT, SELECT | INSERT, SELECT, UPDATE |

> **For MVP:** anonymous inserts on `patients` and `queue_entries` mean patients don't need to create an account. This is intentional — the goal is zero friction for patients. Tighten these policies when adding authentication.

### 5.5 Wire credentials into `.env.local`

1. In the Supabase dashboard, go to **Settings → API**
2. Copy:
   - **Project URL** — starts with `https://`
   - **anon / public** key (under "Project API keys")

3. Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

NEXT_PUBLIC_USE_MOCK_DATA=false

NEXT_PUBLIC_HOSPITAL_NAME="Rajiv Gandhi District Hospital"
NEXT_PUBLIC_HOSPITAL_TAGLINE="Govt. of Maharashtra · जिला अस्पताल"
NEXT_PUBLIC_HELPDESK_PHONE=1800-222-3344
```

4. Restart the dev server:

```bash
# Stop the running server (Ctrl+C), then:
npm run dev
```

### 5.6 Verify the connection

Open **http://localhost:3000** and walk through the flow:

1. Go to `/register`, fill in details, submit
2. Select a department → select a doctor → tap "Join Queue"
3. You should be redirected to `/confirm` with a real token number from Supabase

Check the Supabase dashboard → **Table Editor → queue_entries** — you should see your new row.

---

## 6. Seed Data (Optional)

To pre-populate departments and a doctor for testing with Supabase:

```sql
-- (Already included in schema.sql — departments are seeded)
-- Add a test doctor:
INSERT INTO doctors (name, specialty, room, department_id, status)
VALUES ('Dr. A. Sharma', 'General Physician', 'Room 4', 'general', 'available');

-- Create a queue for that doctor:
INSERT INTO queues (doctor_id, current_token, is_paused)
SELECT id, 40, false FROM doctors WHERE name = 'Dr. A. Sharma';
```

Run this in the Supabase SQL Editor.

---

## 7. Deploying to Vercel

### Step 1 — Push to GitHub

```bash
# Create a repo on github.com, then:
git remote add origin https://github.com/<your-username>/hospitesch.git
git push -u origin main
```

### Step 2 — Import into Vercel

1. Go to **https://vercel.com** and sign in
2. Click **Add New → Project**
3. Import your GitHub repository
4. Vercel detects Next.js automatically — no config needed

### Step 3 — Add Environment Variables

In the Vercel project settings → **Environment Variables**, add each variable from `.env.local`:

| Key | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon key |
| `NEXT_PUBLIC_USE_MOCK_DATA` | `false` |
| `NEXT_PUBLIC_HOSPITAL_NAME` | Your hospital name |
| `NEXT_PUBLIC_HOSPITAL_TAGLINE` | Your hospital tagline |
| `NEXT_PUBLIC_HELPDESK_PHONE` | Your helpdesk number |

Set them for **Production**, **Preview**, and **Development** environments.

### Step 4 — Deploy

Click **Deploy**. Vercel runs `npm run build` and deploys.

Your app will be live at: `https://hospitesch.vercel.app` (or your custom domain).

### Step 5 — Set up your QR code

Once deployed, generate a QR code for your production URL:
- Use any free QR generator (e.g. https://qr-code-generator.com)
- Link it to: `https://your-app.vercel.app`
- Print and post at OPD block entry points

### Continuous deployment

Every `git push` to `main` triggers an automatic Vercel redeploy. Feature branches get preview URLs automatically.

---

## 8. Customising the Hospital Brand

### Hospital name and tagline
Edit `.env.local` (local) or Vercel environment variables (production):

```env
NEXT_PUBLIC_HOSPITAL_NAME="AIIMS New Delhi"
NEXT_PUBLIC_HOSPITAL_TAGLINE="Ministry of Health · स्वास्थ्य मंत्रालय"
```

### Departments
Edit `src/lib/mockData.ts` → `MOCK_DEPARTMENTS` array:

```typescript
export const MOCK_DEPARTMENTS: Department[] = [
  {
    id:          'general',
    name:        'General OPD',
    nameHi:      'सामान्य ओपीडी',
    icon:        'ShieldCheck',
    color:       '#1565C0',
    bg:          '#E3F2FD',
    activeQueue: 16,
    avgWaitMins: 22,
  },
  // ... add your departments
];
```

When Supabase is connected, departments come from the `departments` table instead. Edit them in the Supabase Table Editor or via SQL.

### Doctors
Edit `src/lib/mockData.ts` → `MOCK_DOCTORS` map (mock mode) or insert rows into the `doctors` table in Supabase.

### Primary colour
Edit `src/theme/colors.ts` → `primary` and `primaryDark`:

```typescript
export const colors = {
  primary:     '#00796B',  // Teal instead of Blue
  primaryDark: '#004D40',
  // ...
};
```

---

## 9. Adding a Language

1. **Create the locale file:**

```bash
cp src/locales/en.ts src/locales/mr.ts   # Marathi example
```

2. **Translate all strings** in `src/locales/mr.ts`. Every key in `en.ts` must have a corresponding translation. TypeScript will error if any key is missing.

3. **Register the locale** in `src/lib/i18n.ts`:

```typescript
import en from '@/locales/en';
import hi from '@/locales/hi';
import mr from '@/locales/mr';  // ← add this

export const locales = { en, hi, mr } as const;  // ← add mr
export type Locale = keyof typeof locales;
export const supportedLocales: Locale[] = ['en', 'hi', 'mr'];  // ← add mr
```

4. **Update the toggle button** in `src/components/layout/PatientHeader.tsx`:

```tsx
// Current (2-language toggle):
const toggleLocale = () => {
  const next: Locale = locale === 'en' ? 'hi' : 'en';
  setLocale(next);
};

// With 3 languages — cycle through them:
const toggleLocale = () => {
  const order: Locale[] = ['en', 'hi', 'mr'];
  const idx = order.indexOf(locale);
  setLocale(order[(idx + 1) % order.length]);
};

// And update the button label:
<button onClick={toggleLocale}>
  {locale === 'en' ? 'हिंदी' : locale === 'hi' ? 'मराठी' : 'EN'}
</button>
```

5. Run `npm run type-check` to confirm there are no missing translation keys.

---

## 10. Common Errors & Fixes

### `supabaseUrl is required`

**Cause:** `createClient` was called with an empty URL string.

**Fix:** This is handled by the lazy client in `src/lib/supabase.ts` — it only instantiates when credentials are present. If you see this error, confirm:
- `NEXT_PUBLIC_SUPABASE_URL` is set in `.env.local`
- The value starts with `https://`
- You've restarted the dev server after editing `.env.local`

---

### `Error: Module not found: Can't resolve '@/...'`

**Cause:** TypeScript path alias `@/` not resolving.

**Fix:** Ensure `tsconfig.json` has:
```json
"paths": { "@/*": ["./src/*"] }
```
And `next.config.ts` does not override module resolution.

---

### Emotion styles not applying in production

**Cause:** Emotion's SSR cache not set up correctly.

**Fix:** Confirm `src/lib/EmotionRegistry.tsx` is imported in `src/app/layout.tsx` and wraps `{children}`. The `useServerInsertedHTML` hook collects styles during SSR and injects them into the `<head>`.

---

### Realtime not updating

**Cause:** Realtime is disabled for the table, or the channel filter is wrong.

**Fix checklist:**
1. Go to Supabase → Database → Replication → confirm `queues` table is enabled
2. Confirm the `queueId` passed to `useRealtimeQueue()` matches the actual row ID in Supabase
3. Open browser Network tab → look for a WebSocket connection to `wss://xxx.supabase.co/realtime/v1/websocket`
4. Check Supabase → Realtime → Inspector for event logs

---

### Zustand state not persisting across refresh

**Cause:** `persist` middleware serialises to `localStorage` — if the key changes, old data is lost.

**Expected behaviour:** Only `locale` and `activeEntry` are persisted (see `partialize` in `patientStore.ts`). Everything else (form data, selected dept/doctor) is cleared on refresh by design.

**Fix:** If you need more fields persisted, add them to the `partialize` function:
```typescript
partialize: (s) => ({
  locale:      s.locale,
  activeEntry: s.activeEntry,
  patient:     s.patient,  // ← add if needed
}),
```

---

### Form validation errors not in Hindi

**Cause:** The Zod schema is built inside the component using `t()`. If `locale` changes after the schema is built, errors remain in the previous language.

**Fix:** The schema is rebuilt on every render because it's defined inside the component function. Re-submitting the form after a locale change will show errors in the new language.

---

### Build fails with `Type error`

Run:
```bash
npm run type-check
```
This runs `tsc --noEmit` and shows exactly which file and line has the type error.

---

## 11. npm Scripts Reference

| Script | Command | Description |
|---|---|---|
| Development | `npm run dev` | Start Next.js dev server on port 3000 with hot reload |
| Production build | `npm run build` | Build and type-check for production |
| Production serve | `npm run start` | Serve the production build locally |
| Lint | `npm run lint` | Run ESLint (next/core-web-vitals + next/typescript) |
| Type check | `npm run type-check` | Run `tsc --noEmit` without building |

### Recommended development workflow

```bash
# 1. Start dev server (leave running)
npm run dev

# 2. Before committing — check types and lint
npm run type-check && npm run lint

# 3. Verify production build works before pushing
npm run build
```

# HospiTesch — Smart Hospital Queue System

> Realtime QR-based OPD queue management platform for government and high-volume hospitals in India.

---

## Tech Stack

| Layer             | Technology                     |
|-------------------|-------------------------------|
| Framework         | Next.js 15 (App Router)        |
| UI                | React 18 + Emotion CSS         |
| State             | Zustand 5                      |
| Forms             | React Hook Form + Zod          |
| Icons             | Lucide React                   |
| Backend           | Supabase (PostgreSQL + Realtime)|
| Hosting           | Vercel                         |
| Languages         | English + Hindi (i18n)         |

---

## Quick Start

```bash
cd hospitesch
cp .env.example .env.local   # fill in Supabase keys (or leave USE_MOCK_DATA=true)
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **No Supabase needed for dev**: set `NEXT_PUBLIC_USE_MOCK_DATA=true` in `.env.local` and everything works with in-memory mock data.

---

## Patient Flow (Phase 1)

```
/ (QR Landing)
  → /register       Patient details (name, mobile, age, gender)
  → /department     Choose department
  → /doctor/:deptId Pick a doctor & join queue
  → /confirm        Token issued — reassurance screen
  → /track          Live queue tracking (realtime)
  → /help           Help & support
```

---

## Multilingual

The app ships with **English** and **Hindi** translations out of the box.

- Translations live in `src/locales/en.ts` and `src/locales/hi.ts`
- A language toggle button appears in the header
- Preference is persisted in `localStorage` via Zustand

To add a new language:
1. Copy `src/locales/en.ts` → `src/locales/mr.ts` (e.g. Marathi)
2. Translate all strings
3. Add `mr` to `supportedLocales` in `src/lib/i18n.ts`
4. The toggle will include it automatically

---

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in the SQL Editor
3. Copy **Project URL** and **anon key** into `.env.local`
4. Enable Realtime for the `queues` and `queue_entries` tables in Dashboard → Database → Replication
5. Set `NEXT_PUBLIC_USE_MOCK_DATA=false`

---

## Folder Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── page.tsx         # QR Landing
│   ├── register/        # Patient registration
│   ├── department/      # Department selection
│   ├── doctor/[deptId]/ # Doctor selection + join queue
│   ├── confirm/         # Token confirmation
│   ├── track/           # Live queue tracking
│   └── help/            # Help & support
├── components/
│   ├── ui/              # Primitives: Button, Card, Field, Badge…
│   ├── layout/          # PatientHeader, BackBar, BottomNav, MobileLayout
│   └── patient/         # DepartmentCard, DoctorCard, QueueWidget, LiveTracker
├── hooks/               # useTranslation, useQueue (realtime)
├── lib/                 # supabase.ts, i18n.ts, EmotionRegistry, mockData
├── locales/             # en.ts  hi.ts
├── services/            # patientService, queueService
├── store/               # patientStore, queueStore (Zustand)
├── theme/               # colors, spacing, typography, shadows
├── types/               # patient, department, doctor, queue
└── utils/               # format.ts
supabase/
└── schema.sql           # Full PostgreSQL schema with RLS
```

---

## Phase 2 Roadmap (Admin / Doctor Flow)

- [ ] Doctor login (Supabase Auth)
- [ ] Doctor queue dashboard (Next / Skip / Pause)
- [ ] Queue TV display screen
- [ ] SMS notifications (Twilio / MSG91)
- [ ] Multi-hospital support

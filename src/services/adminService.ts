'use server';

import { isSupabaseConfigured } from '@/lib/supabase';
import { isAdminClientConfigured, getAdminClient } from '@/lib/supabaseAdmin';
import {
  mockQueueStates,
  MOCK_STAFF,
  getAllMockQueues,
} from '@/lib/mockAdminData';
import type { AdminQueueState, DoctorQueueSummary } from '@/types/staff';

const isMock = !isSupabaseConfigured || !isAdminClientConfigured;

function fmtLabel(prefix: string, n: number) {
  return `${prefix}-${String(n).padStart(3, '0')}`;
}

// ── helpers ────────────────────────────────────────────────────────────

/** Returns the queue key for mock data from a queueId or staffId */
function getMockKey(queueId: string): string | undefined {
  return Object.keys(mockQueueStates).find(
    (k) => mockQueueStates[k].queueId === queueId,
  );
}

// ── public actions ─────────────────────────────────────────────────────

/**
 * Fetches the full AdminQueueState for a given queue.
 * The doctor's dashboard calls this on mount and after each action.
 */
export async function getAdminQueueState(
  queueId: string,
): Promise<AdminQueueState | null> {
  if (isMock) {
    const key = getMockKey(queueId);
    return key ? { ...mockQueueStates[key] } : null;
  }

  const admin = getAdminClient();
  const { data: queue, error } = await admin
    .from('queues')
    .select(`
      id, current_token, is_paused, skipped_tokens, updated_at, hospital_id,
      doctors(id, name, room, department_id, departments(name))
    `)
    .eq('id', queueId)
    .single();

  if (error || !queue) return null;

  const { data: entries } = await admin
    .from('queue_entries')
    .select('token_number, token_label, patients(name, age, gender)')
    .eq('queue_id', queueId)
    .eq('status', 'waiting')
    .order('token_number', { ascending: true });

  const doctor = queue.doctors as unknown as {
    id: string; name: string; room: string; department_id: string;
    departments: { name: string };
  };
  const prefix = (doctor.department_id?.[0] ?? 'G').toUpperCase();
  const skippedTokens: number[] = queue.skipped_tokens ?? [];

  return {
    queueId:          queue.id,
    doctorId:         doctor.id,
    doctorName:       doctor.name,
    room:             doctor.room,
    departmentId:     doctor.department_id,
    departmentName:   doctor.departments?.name ?? '',
    hospitalId:       queue.hospital_id,
    currentToken:     queue.current_token,
    currentTokenLabel: fmtLabel(prefix, queue.current_token),
    isPaused:         queue.is_paused,
    skipped:          skippedTokens.map((t) => ({ token: t, label: fmtLabel(prefix, t) })),
    lastCallAt:       new Date(queue.updated_at).getTime(),
    avgMins:          4,
    upcoming:         (entries ?? []).map((e) => {
      const p = e.patients as unknown as { name: string; age: number; gender: string };
      return {
        token: e.token_number,
        label: e.token_label,
        patientName: p?.name ?? 'Patient',
        age: p?.age,
        gender: p?.gender,
      };
    }),
    seenToday: queue.current_token,
  };
}

/**
 * Advances the queue to the next patient.
 * Marks the current patient as 'done', increments current_token.
 * Doctor can only call this for their own queue.
 */
export async function callNextInQueue(
  queueId: string,
): Promise<AdminQueueState | null> {
  if (isMock) {
    const key = getMockKey(queueId);
    if (!key) return null;
    const q = mockQueueStates[key];
    if (q.isPaused) return { ...q };

    const nextToken = q.currentToken + 1;
    const prefix = (q.departmentId[0] ?? 'G').toUpperCase();

    mockQueueStates[key] = {
      ...q,
      currentToken:     nextToken,
      currentTokenLabel: fmtLabel(prefix, nextToken),
      upcoming:         q.upcoming.filter((e) => e.token !== nextToken),
      seenToday:        q.seenToday + 1,
      lastCallAt:       Date.now(),
    };
    return { ...mockQueueStates[key] };
  }

  const admin = getAdminClient();

  // Get current state
  const { data: queue } = await admin
    .from('queues')
    .select('current_token, is_paused')
    .eq('id', queueId)
    .single();

  if (!queue || queue.is_paused) return getAdminQueueState(queueId);

  const currentToken = queue.current_token;
  const nextToken    = currentToken + 1;

  // Mark current entry as done
  await admin
    .from('queue_entries')
    .update({ status: 'done' })
    .eq('queue_id', queueId)
    .eq('token_number', currentToken)
    .eq('status', 'waiting');

  // Increment current_token (triggers updated_at via trigger)
  await admin
    .from('queues')
    .update({ current_token: nextToken })
    .eq('id', queueId);

  return getAdminQueueState(queueId);
}

/**
 * Skips the next patient in queue (adds their token to skipped list).
 * Advances current_token past the skipped entry.
 */
export async function skipNextInQueue(
  queueId: string,
): Promise<AdminQueueState | null> {
  if (isMock) {
    const key = getMockKey(queueId);
    if (!key) return null;
    const q = mockQueueStates[key];
    if (q.upcoming.length === 0) return { ...q };

    const skipToken  = q.upcoming[0].token;
    const prefix     = (q.departmentId[0] ?? 'G').toUpperCase();

    mockQueueStates[key] = {
      ...q,
      skipped:  [...q.skipped, { token: skipToken, label: fmtLabel(prefix, skipToken) }],
      upcoming: q.upcoming.slice(1),
    };
    return { ...mockQueueStates[key] };
  }

  const admin = getAdminClient();

  const { data: queue } = await admin
    .from('queues')
    .select('current_token, skipped_tokens')
    .eq('id', queueId)
    .single();

  if (!queue) return null;

  const nextToken    = queue.current_token + 1;
  const skipped      = [...(queue.skipped_tokens ?? []), nextToken];

  await admin
    .from('queue_entries')
    .update({ status: 'skipped' })
    .eq('queue_id', queueId)
    .eq('token_number', nextToken);

  await admin
    .from('queues')
    .update({ current_token: nextToken, skipped_tokens: skipped })
    .eq('id', queueId);

  return getAdminQueueState(queueId);
}

/**
 * Toggles pause state of the queue.
 */
export async function toggleQueuePause(
  queueId: string,
): Promise<AdminQueueState | null> {
  if (isMock) {
    const key = getMockKey(queueId);
    if (!key) return null;
    mockQueueStates[key] = {
      ...mockQueueStates[key],
      isPaused: !mockQueueStates[key].isPaused,
    };
    return { ...mockQueueStates[key] };
  }

  const admin = getAdminClient();
  const { data: queue } = await admin
    .from('queues')
    .select('is_paused')
    .eq('id', queueId)
    .single();

  if (!queue) return null;

  await admin
    .from('queues')
    .update({ is_paused: !queue.is_paused })
    .eq('id', queueId);

  return getAdminQueueState(queueId);
}

/**
 * Recalls a previously skipped token back to the top of the queue.
 */
export async function recallSkippedToken(
  queueId: string,
  tokenNumber: number,
): Promise<AdminQueueState | null> {
  if (isMock) {
    const key = getMockKey(queueId);
    if (!key) return null;
    const q = mockQueueStates[key];
    const prefix = (q.departmentId[0] ?? 'G').toUpperCase();

    const recalledEntry = {
      token: tokenNumber,
      label: fmtLabel(prefix, tokenNumber),
      patientName: 'Recalled Patient',
      age: 35,
    };
    mockQueueStates[key] = {
      ...q,
      skipped:  q.skipped.filter((s) => s.token !== tokenNumber),
      upcoming: [recalledEntry, ...q.upcoming],
    };
    return { ...mockQueueStates[key] };
  }

  const admin = getAdminClient();

  // Restore the queue entry status back to 'waiting'
  await admin
    .from('queue_entries')
    .update({ status: 'waiting' })
    .eq('queue_id', queueId)
    .eq('token_number', tokenNumber);

  // Remove from skipped_tokens array
  const { data: queue } = await admin
    .from('queues')
    .select('skipped_tokens')
    .eq('id', queueId)
    .single();

  if (queue) {
    const skipped = (queue.skipped_tokens ?? []).filter((t: number) => t !== tokenNumber);
    await admin
      .from('queues')
      .update({ skipped_tokens: skipped })
      .eq('id', queueId);
  }

  return getAdminQueueState(queueId);
}

// ── History ────────────────────────────────────────────────────────────

export interface HistoryEntry {
  id: string;
  tokenLabel: string;
  tokenNumber: number;
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  doctorId: string;
  doctorName: string;
  departmentId: string;
  departmentName: string;
  status: 'done' | 'skipped';
  servedAt: string; // ISO timestamp
}

export interface HistoryFilters {
  date: string;          // YYYY-MM-DD, defaults to today
  doctorId?: string;     // admin filter
  departmentId?: string; // admin filter
  queueId?: string;      // doctor: always their own queue
  hospitalId?: string;
}

const MOCK_NAMES = ['Asha Devi', 'Ramesh Kumar', 'Sunita Sharma', 'Imran Khan', 'Priya Verma', 'Raj Singh', 'Meera Nair', 'Suresh Patel'];

function getMockHistory(filters: HistoryFilters): HistoryEntry[] {
  const entries: HistoryEntry[] = [];

  const queues = filters.queueId
    ? Object.values(mockQueueStates).filter((q) => q.queueId === filters.queueId)
    : Object.values(mockQueueStates);

  for (const q of queues) {
    if (filters.doctorId && q.doctorId !== filters.doctorId) continue;
    if (filters.departmentId && q.departmentId !== filters.departmentId) continue;

    const prefix = (q.departmentId[0] ?? 'G').toUpperCase();
    for (let i = 0; i < q.seenToday; i++) {
      entries.push({
        id:             `${q.queueId}-${i}`,
        tokenLabel:     fmtLabel(prefix, i + 1),
        tokenNumber:    i + 1,
        patientName:    MOCK_NAMES[i % MOCK_NAMES.length],
        patientAge:     25 + (i * 7 % 55),
        patientGender:  (['M', 'F', 'O'] as const)[i % 3],
        doctorId:       q.doctorId,
        doctorName:     q.doctorName,
        departmentId:   q.departmentId,
        departmentName: q.departmentName,
        status:         i % 9 === 0 ? 'skipped' : 'done',
        servedAt:       new Date(Date.now() - (q.seenToday - i) * q.avgMins * 60_000).toISOString(),
      });
    }
  }

  return entries.sort((a, b) => b.servedAt.localeCompare(a.servedAt));
}

/**
 * Fetches completed/skipped queue entries for a given date and optional filters.
 * Doctor role: always scoped to their own queue.
 * Admin role: whole hospital, with optional doctor/department filters.
 */
export async function getQueueHistory(filters: HistoryFilters): Promise<HistoryEntry[]> {
  if (isMock) return getMockHistory(filters);

  const admin = getAdminClient();

  const dateStart = new Date(`${filters.date}T00:00:00`);
  const dateEnd   = new Date(`${filters.date}T23:59:59`);

  let query = admin
    .from('queue_entries')
    .select(`
      id, token_label, token_number, status, created_at,
      doctor_id, queue_id, department_id,
      patients(name, age, gender),
      doctors(id, name, department_id, departments(id, name))
    `)
    .in('status', ['done', 'skipped'])
    .gte('created_at', dateStart.toISOString())
    .lte('created_at', dateEnd.toISOString())
    .order('created_at', { ascending: false });

  if (filters.queueId)      query = query.eq('queue_id',    filters.queueId);
  if (filters.hospitalId)   query = query.eq('hospital_id', filters.hospitalId);
  if (filters.doctorId)     query = query.eq('doctor_id',   filters.doctorId);
  if (filters.departmentId) query = query.eq('department_id', filters.departmentId);

  const { data, error } = await query;
  if (error || !data) return [];

  return data.map((e) => {
    const patient = e.patients as unknown as { name: string; age: number; gender: string } | null;
    const doctor  = e.doctors  as unknown as { id: string; name: string; department_id: string; departments: { id: string; name: string } } | null;
    return {
      id:             e.id,
      tokenLabel:     e.token_label,
      tokenNumber:    e.token_number,
      patientName:    patient?.name    ?? 'Patient',
      patientAge:     patient?.age,
      patientGender:  patient?.gender,
      doctorId:       doctor?.id       ?? e.doctor_id,
      doctorName:     doctor?.name     ?? '—',
      departmentId:   doctor?.departments?.id ?? e.department_id ?? '',
      departmentName: doctor?.departments?.name ?? '—',
      status:         e.status as 'done' | 'skipped',
      servedAt:       e.created_at,
    };
  });
}

/**
 * Returns a summary of all active queues in a hospital.
 * Used by admin overview and TV display.
 */
export async function getHospitalQueueOverview(
  hospitalId: string,
): Promise<DoctorQueueSummary[]> {
  if (isMock) {
    return getAllMockQueues();
  }

  const admin = getAdminClient();
  const { data: queues, error } = await admin
    .from('queues')
    .select(`
      id, current_token, is_paused, updated_at,
      doctors(id, name, room, department_id, departments(name))
    `)
    .eq('hospital_id', hospitalId);

  if (error || !queues) return [];

  const summaries: DoctorQueueSummary[] = await Promise.all(
    queues.map(async (q) => {
      const doctor = q.doctors as unknown as {
        id: string; name: string; room: string;
        department_id: string; departments: { name: string };
      };
      const prefix = (doctor.department_id?.[0] ?? 'G').toUpperCase();

      const { count } = await admin
        .from('queue_entries')
        .select('id', { count: 'exact', head: true })
        .eq('queue_id', q.id)
        .eq('status', 'waiting');

      return {
        queueId:          q.id,
        doctorId:         doctor.id,
        doctorName:       doctor.name,
        room:             doctor.room,
        departmentId:     doctor.department_id,
        departmentName:   doctor.departments?.name ?? '',
        currentToken:     q.current_token,
        currentTokenLabel: fmtLabel(prefix, q.current_token),
        isPaused:         q.is_paused,
        queueLength:      count ?? 0,
        lastCallAt:       new Date(q.updated_at).getTime(),
      };
    }),
  );

  return summaries;
}

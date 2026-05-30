'use server';

import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { buildMockLiveQueue, fmtToken } from '@/lib/mockData';
import { checkRateLimit } from '@/lib/rateLimit';
import type { QueueEntry, LiveQueueState } from '@/types/queue';

let mockTokenCounter = 47;

interface JoinQueueInput {
  patientId: string;
  doctorId: string;
  departmentId: string;
  doctorName: string;
  departmentName: string;
  room: string;
}

export interface JoinQueueResult {
  entry: QueueEntry;
  alreadyInQueue: boolean;
}

export async function joinQueue(input: JoinQueueInput): Promise<JoinQueueResult> {
  const rl = checkRateLimit(`join:${input.patientId}`, 'joinQueue');
  if (!rl.allowed) {
    throw new Error(`Too many queue join attempts. Please wait ${Math.ceil((rl.retryAfterMs ?? 60000) / 1000)}s before trying again.`);
  }

  if (!isSupabaseConfigured) {
    const token = ++mockTokenCounter;
    return {
      alreadyInQueue: false,
      entry: {
        id: `mock-entry-${Date.now()}`,
        patient_id: input.patientId,
        queue_id: `mock-queue-${input.doctorId}`,
        doctor_id: input.doctorId,
        department_id: input.departmentId,
        token_number: token,
        token_label: fmtToken(input.departmentId.charAt(0).toUpperCase(), token),
        status: 'waiting',
        created_at: new Date().toISOString(),
      },
    };
  }

  // Check for existing entry and fetch queue ID + hospital_id in parallel
  const [{ data: existingEntry }, { data: queue, error: queueError }] = await Promise.all([
    supabase
      .from('queue_entries')
      .select('*')
      .eq('patient_id', input.patientId)
      .in('status', ['waiting', 'serving'])
      .maybeSingle(),
    supabase
      .from('queues')
      .select('id, hospital_id')
      .eq('doctor_id', input.doctorId)
      .single(),
  ]);

  if (existingEntry) {
    return { entry: existingEntry as QueueEntry, alreadyInQueue: true };
  }

  if (queueError || !queue) {
    throw new Error(
      queueError?.message ??
        `No queue found for doctor ${input.doctorId}. Ask an admin to seed the queues table.`,
    );
  }

  const { data, error } = await supabase
    .from('queue_entries')
    .insert({
      patient_id:    input.patientId,
      queue_id:      queue.id,
      hospital_id:   (queue as { id: string; hospital_id?: string }).hospital_id ?? null,
      doctor_id:     input.doctorId,
      department_id: input.departmentId,
      status:        'waiting',
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return { entry: data as QueueEntry, alreadyInQueue: false };
}

type QueueRow = { id: string; doctor_id: string; current_token: number; is_paused: boolean; updated_at: string };
type EntryRow = { token_number: number; status: string };

function buildLiveState(
  queue: QueueRow,
  entries: EntryRow[],
  queueId: string,
  yourToken: number,
  doctorName: string,
  departmentName: string,
  room: string,
): LiveQueueState {
  const prefix = departmentName.charAt(0).toUpperCase();
  const activeEntries = entries
    .filter((e) => e.status === 'waiting' || e.status === 'serving')
    .sort((a, b) => a.token_number - b.token_number);

  return {
    queueId,
    doctorId: queue.doctor_id,
    doctorName,
    departmentName,
    room,
    currentToken: queue.current_token,
    currentTokenLabel: fmtToken(prefix, queue.current_token),
    yourToken,
    yourTokenLabel: fmtToken(prefix, yourToken),
    doctorStatus: queue.is_paused ? 'paused' : 'available',
    avgMinsPerPatient: 4,
    lastCallAt: new Date(queue.updated_at).getTime(),
    upcomingTokens: activeEntries.map((e) => ({
      token: e.token_number,
      label: fmtToken(prefix, e.token_number),
      isYou: e.token_number === yourToken,
    })),
  };
}

export async function getLiveQueueState(
  queueId: string,
  yourToken: number,
  doctorName: string,
  departmentName: string,
  room: string,
): Promise<LiveQueueState> {
  if (!isSupabaseConfigured) {
    return buildMockLiveQueue('mock-doctor', doctorName, departmentName, room, yourToken);
  }

  // Fetch queue metadata and active entries in parallel; filter entries server-side
  const [{ data: queue, error }, { data: entries }] = await Promise.all([
    supabase
      .from('queues')
      .select('id, doctor_id, current_token, is_paused, updated_at')
      .eq('id', queueId)
      .single(),
    supabase
      .from('queue_entries')
      .select('token_number, status')
      .eq('queue_id', queueId)
      .in('status', ['waiting', 'serving'])
      .order('token_number'),
  ]);

  if (error) throw new Error(error.message);
  return buildLiveState(queue as QueueRow, entries ?? [], queueId, yourToken, doctorName, departmentName, room);
}

export interface JoinQueueAndGetStateResult {
  entry: QueueEntry;
  alreadyInQueue: boolean;
  live: LiveQueueState;
}

/**
 * Combines joinQueue + getLiveQueueState into a single server round-trip.
 * Saves one full POST + Lambda invocation compared to calling them separately.
 */
export async function joinQueueAndGetState(
  input: JoinQueueInput,
): Promise<JoinQueueAndGetStateResult> {
  const joinResult = await joinQueue(input);
  const { entry, alreadyInQueue } = joinResult;

  if (!isSupabaseConfigured) {
    const live = buildMockLiveQueue(input.doctorId, input.doctorName, input.departmentName, input.room, entry.token_number);
    return { entry, alreadyInQueue, live };
  }

  // Fetch queue + active entries in parallel now that we have the queue_id
  const [{ data: queue, error }, { data: entries }] = await Promise.all([
    supabase
      .from('queues')
      .select('id, doctor_id, current_token, is_paused, updated_at')
      .eq('id', entry.queue_id)
      .single(),
    supabase
      .from('queue_entries')
      .select('token_number, status')
      .eq('queue_id', entry.queue_id)
      .in('status', ['waiting', 'serving'])
      .order('token_number'),
  ]);

  if (error) throw new Error(error.message);

  const live = buildLiveState(
    queue as QueueRow,
    entries ?? [],
    entry.queue_id,
    entry.token_number,
    input.doctorName,
    input.departmentName,
    input.room,
  );

  return { entry, alreadyInQueue, live };
}

export async function cancelQueueEntry(entryId: string): Promise<void> {
  if (!isSupabaseConfigured) return;

  const { error } = await supabase
    .from('queue_entries')
    .update({ status: 'skipped' })
    .eq('id', entryId)
    .eq('status', 'waiting');

  if (error) throw new Error(error.message);
}

export async function restoreQueueState(entry: QueueEntry): Promise<LiveQueueState> {
  if (!isSupabaseConfigured) {
    return buildMockLiveQueue('mock-doctor', 'Doctor', 'OPD', 'Room', entry.token_number);
  }

  // Fetch doctor info, queue metadata, and active entries all in parallel
  const [{ data: doctor }, { data: queue, error: queueError }, { data: entries }] = await Promise.all([
    supabase
      .from('doctors')
      .select('name, room, departments(name)')
      .eq('id', entry.doctor_id)
      .single(),
    supabase
      .from('queues')
      .select('id, doctor_id, current_token, is_paused, updated_at')
      .eq('id', entry.queue_id)
      .single(),
    supabase
      .from('queue_entries')
      .select('token_number, status')
      .eq('queue_id', entry.queue_id)
      .in('status', ['waiting', 'serving'])
      .order('token_number'),
  ]);

  if (queueError || !queue) throw new Error(queueError?.message ?? 'Queue not found');

  const doctorName     = doctor?.name ?? 'Doctor';
  const departmentName = (doctor?.departments as unknown as { name: string } | null)?.name ?? 'OPD';
  const room           = doctor?.room ?? '';

  return buildLiveState(queue as QueueRow, entries ?? [], entry.queue_id, entry.token_number, doctorName, departmentName, room);
}

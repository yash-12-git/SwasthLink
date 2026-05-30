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
  // Rate limit: 3 joins per patient per minute (prevents token spam)
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

  // Return existing active entry instead of throwing — let the client redirect gracefully
  const { data: existingEntry } = await supabase
    .from('queue_entries')
    .select('*')
    .eq('patient_id', input.patientId)
    .in('status', ['waiting', 'serving'])
    .maybeSingle();

  if (existingEntry) {
    return { entry: existingEntry as QueueEntry, alreadyInQueue: true };
  }

  // Fetch the pre-seeded queue for this doctor
  const { data: queue, error: queueError } = await supabase
    .from('queues')
    .select('id')
    .eq('doctor_id', input.doctorId)
    .single();

  if (queueError || !queue) {
    throw new Error(
      queueError?.message ??
        `No queue found for doctor ${input.doctorId}. Ask an admin to seed the queues table.`,
    );
  }

  // Insert queue entry — token_number + token_label auto-assigned by DB trigger
  const { data, error } = await supabase
    .from('queue_entries')
    .insert({
      patient_id: input.patientId,
      queue_id: queue.id,
      doctor_id: input.doctorId,
      department_id: input.departmentId,
      status: 'waiting',
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return { entry: data as QueueEntry, alreadyInQueue: false };
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

  const { data: queue, error } = await supabase
    .from('queues')
    .select('*, queue_entries(*)')
    .eq('id', queueId)
    .single();

  if (error) throw new Error(error.message);

  const entries = (queue.queue_entries as QueueEntry[]).filter(
    (e) => e.status === 'waiting' || e.status === 'serving',
  );
  entries.sort((a, b) => a.token_number - b.token_number);

  const prefix = departmentName.charAt(0).toUpperCase();
  const upcomingTokens = entries.map((e) => ({
    token: e.token_number,
    label: fmtToken(prefix, e.token_number),
    isYou: e.token_number === yourToken,
  }));

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
    upcomingTokens,
  };
}

/**
 * Cancels a queue entry — sets status to 'cancelled' so the patient can rebook.
 * Only works for 'waiting' entries; a 'serving' entry can only be closed by admin.
 */
export async function cancelQueueEntry(entryId: string): Promise<void> {
  if (!isSupabaseConfigured) return; // mock mode: just drop locally

  const { error } = await supabase
    .from('queue_entries')
    .update({ status: 'skipped' })
    .eq('id', entryId)
    .eq('status', 'waiting'); // don't touch if already serving/done

  if (error) throw new Error(error.message);
}

/**
 * Rebuilds live queue state from a persisted QueueEntry (e.g. after page refresh).
 * Fetches doctor + department names from the DB so callers don't need to pass them.
 */
export async function restoreQueueState(entry: QueueEntry): Promise<LiveQueueState> {
  if (!isSupabaseConfigured) {
    return buildMockLiveQueue('mock-doctor', 'Doctor', 'OPD', 'Room', entry.token_number);
  }

  const { data: doctor } = await supabase
    .from('doctors')
    .select('name, room, departments(name)')
    .eq('id', entry.doctor_id)
    .single();

  const doctorName     = doctor?.name ?? 'Doctor';
  const departmentName = (doctor?.departments as unknown as { name: string } | null)?.name ?? 'OPD';
  const room           = doctor?.room ?? '';

  return getLiveQueueState(entry.queue_id, entry.token_number, doctorName, departmentName, room);
}

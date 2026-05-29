'use server';

import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { buildMockLiveQueue, fmtToken } from '@/lib/mockData';
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

export async function joinQueue(input: JoinQueueInput): Promise<QueueEntry> {
  if (!isSupabaseConfigured) {
    const token = ++mockTokenCounter;
    return {
      id: `mock-entry-${Date.now()}`,
      patient_id: input.patientId,
      queue_id: `mock-queue-${input.doctorId}`,
      doctor_id: input.doctorId,
      department_id: input.departmentId,
      token_number: token,
      token_label: fmtToken(input.departmentId.charAt(0).toUpperCase(), token),
      status: 'waiting',
      created_at: new Date().toISOString(),
    };
  }

  // 1. Upsert queue row for this doctor
  const { data: queue } = await supabase
    .from('queues')
    .upsert({ doctor_id: input.doctorId }, { onConflict: 'doctor_id' })
    .select()
    .single();

  // 2. Insert queue entry — token auto-increments via DB function
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
  return data as QueueEntry;
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

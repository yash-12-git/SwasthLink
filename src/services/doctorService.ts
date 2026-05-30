'use server';

import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { MOCK_DOCTORS } from '@/lib/mockData';
import type { Doctor, DoctorStatus } from '@/types/doctor';

export async function getDoctorsByDepartment(deptId: string): Promise<Doctor[]> {
  if (!isSupabaseConfigured) {
    return MOCK_DOCTORS[deptId] ?? MOCK_DOCTORS.general ?? [];
  }

  // Fetch doctors + their queue row in one query
  const { data: doctors, error } = await supabase
    .from('doctors')
    .select('*, queues(id, current_token, is_paused)')
    .eq('department_id', deptId)
    .order('created_at');

  if (error) throw new Error(error.message);
  if (!doctors?.length) return [];

  // Collect queue IDs so we can count waiting entries in a single query
  const queueIds = doctors
    .map((d) => (d.queues as { id: string } | null)?.id)
    .filter((id): id is string => Boolean(id));

  const { data: entries } = queueIds.length
    ? await supabase
        .from('queue_entries')
        .select('queue_id')
        .in('queue_id', queueIds)
        .eq('status', 'waiting')
    : { data: [] as { queue_id: string }[] };

  // Build a count-by-queue-id map
  const countByQueue: Record<string, number> = {};
  for (const e of entries ?? []) {
    countByQueue[e.queue_id] = (countByQueue[e.queue_id] ?? 0) + 1;
  }

  return doctors.map((d) => {
    const queue = d.queues as { id: string; current_token: number; is_paused: boolean } | null;
    const queueCount = queue ? (countByQueue[queue.id] ?? 0) : 0;
    return {
      id:            d.id,
      name:          d.name,
      specialty:     d.specialty ?? '',
      room:          d.room ?? '',
      department_id: d.department_id,
      status:        (queue?.is_paused ? 'paused' : d.status) as DoctorStatus,
      queue_count:   queueCount,
      avg_wait_mins: queueCount > 0 ? queueCount * 4 : null,
    };
  });
}

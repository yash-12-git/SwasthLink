'use server';

import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { MOCK_DOCTORS } from '@/lib/mockData';
import type { Doctor, DoctorStatus } from '@/types/doctor';

export async function getDoctorsByDepartment(deptId: string, hospitalSlug?: string): Promise<Doctor[]> {
  if (!isSupabaseConfigured) {
    return MOCK_DOCTORS[deptId] ?? MOCK_DOCTORS.general ?? [];
  }

  let hospitalId: string | null = null;
  if (hospitalSlug) {
    const { data: hosp } = await supabase.from('hospitals').select('id').eq('slug', hospitalSlug).single();
    hospitalId = hosp?.id ?? null;
  }

  // Single query: doctors + their queue + waiting entry count via nested select
  let query = supabase
    .from('doctors')
    .select('*, queues(id, current_token, is_paused, queue_entries(queue_id, status))')
    .eq('department_id', deptId);

  if (hospitalId) query = query.eq('hospital_id', hospitalId);

  const { data: doctors, error } = await query.order('created_at');

  if (error) throw new Error(error.message);
  if (!doctors?.length) return [];

  return doctors.map((d) => {
    const queue = d.queues as {
      id: string;
      current_token: number;
      is_paused: boolean;
      queue_entries: { queue_id: string; status: string }[];
    } | null;
    const queueCount = queue?.queue_entries?.filter((e) => e.status === 'waiting').length ?? 0;
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

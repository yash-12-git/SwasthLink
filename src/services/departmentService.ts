'use server';

import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { MOCK_DEPARTMENTS, fmtToken } from '@/lib/mockData';
import type { Department } from '@/types/department';

export interface DeptQueueOverview {
  deptId:            string;
  deptName:          string;
  deptNameHi:        string;
  currentTokenLabel: string;
  color:             string;
}

export async function getDepartments(hospitalSlug?: string): Promise<Department[]> {
  if (!isSupabaseConfigured) {
    return MOCK_DEPARTMENTS;
  }

  let hospitalId: string | null = null;
  if (hospitalSlug) {
    const { data: hosp } = await supabase
      .from('hospitals')
      .select('id')
      .eq('slug', hospitalSlug)
      .single();
    hospitalId = hosp?.id ?? null;
  }

  let query = supabase
    .from('departments')
    .select('id, name, name_hi, icon, color, bg, sort_order');

  if (hospitalId) query = query.eq('hospital_id', hospitalId);

  const { data, error } = await query.order('sort_order');

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id:    row.id,
    name:  row.name,
    nameHi: row.name_hi ?? row.name,
    icon:  row.icon,
    color: row.color,
    bg:    row.bg,
  })) as Department[];
}

/** Returns current-token info for each department — used on the landing page "Now Serving" strip. */
export async function getLiveOverview(hospitalSlug?: string): Promise<DeptQueueOverview[]> {
  if (!isSupabaseConfigured) {
    return [
      { deptId: 'general', deptName: 'General OPD', deptNameHi: 'सामान्य ओपीडी', currentTokenLabel: 'G-042', color: '#1565C0' },
      { deptId: 'cardio',  deptName: 'Cardiology',  deptNameHi: 'हृदय रोग',       currentTokenLabel: 'C-118', color: '#D32F2F' },
    ];
  }

  // Join queues → doctors → departments to get current token per department
  let query = supabase
    .from('queues')
    .select('current_token, hospital_id, doctors(department_id, departments(id, name, name_hi, color))')
    .eq('is_paused', false);

  if (hospitalSlug) {
    const { data: hosp } = await supabase.from('hospitals').select('id').eq('slug', hospitalSlug).single();
    if (hosp) query = query.eq('hospital_id', hosp.id);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);

  // Group by department, keep the highest current_token seen per dept
  const byDept = new Map<string, { name: string; nameHi: string; token: number; color: string }>();
  for (const row of data ?? []) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dept = (row.doctors as any)?.departments;
    if (!dept) continue;
    const existing = byDept.get(dept.id);
    if (!existing || row.current_token > existing.token) {
      byDept.set(dept.id, {
        name:   dept.name,
        nameHi: dept.name_hi ?? dept.name,
        token:  row.current_token,
        color:  dept.color ?? '#1565C0',
      });
    }
  }

  return Array.from(byDept.entries()).slice(0, 2).map(([deptId, info]) => ({
    deptId,
    deptName:          info.name,
    deptNameHi:        info.nameHi,
    currentTokenLabel: fmtToken(deptId.charAt(0).toUpperCase(), info.token),
    color:             info.color,
  }));
}

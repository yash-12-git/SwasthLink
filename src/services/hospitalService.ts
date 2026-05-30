'use server';

import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import type { Hospital } from '@/types/hospital';

const MOCK_HOSPITAL: Hospital = {
  id:              'mock-hospital',
  slug:            'dgh',
  name:            process.env.NEXT_PUBLIC_HOSPITAL_NAME ?? 'District General Hospital',
  name_hi:         'जिला सामान्य अस्पताल',
  city:            'New Delhi',
  helpdesk_phone:  process.env.NEXT_PUBLIC_HELPDESK_PHONE ?? '1800-180-1104',
};

/** Fetches hospital by slug (QR code parameter). Falls back to mock. */
export async function getHospitalBySlug(slug: string): Promise<Hospital | null> {
  if (!isSupabaseConfigured) {
    return MOCK_HOSPITAL;
  }

  const { data, error } = await supabase
    .from('hospitals')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;
  return data as Hospital;
}

/** Returns the default hospital (from env or first row). */
export async function getDefaultHospital(): Promise<Hospital> {
  if (!isSupabaseConfigured) return MOCK_HOSPITAL;

  const { data } = await supabase
    .from('hospitals')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(1)
    .single();

  return (data as Hospital) ?? MOCK_HOSPITAL;
}

/** Lists all hospitals (superadmin only). */
export async function listHospitals(): Promise<Hospital[]> {
  if (!isSupabaseConfigured) return [MOCK_HOSPITAL];

  const { data } = await supabase.from('hospitals').select('*').order('name');
  return (data as Hospital[]) ?? [];
}

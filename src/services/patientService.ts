'use server';

import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Patient, PatientInput } from '@/types/patient';

let mockIdCounter = 1000;

export async function createPatient(input: PatientInput): Promise<Patient> {
  if (!isSupabaseConfigured) {
    // Mock mode — return a fake patient record
    return {
      id: `mock-patient-${++mockIdCounter}`,
      ...input,
      created_at: new Date().toISOString(),
    };
  }

  const { data, error } = await supabase
    .from('patients')
    .insert(input)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Patient;
}

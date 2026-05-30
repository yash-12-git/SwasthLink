'use server';

import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Account } from '@/types/account';
import type { Patient, PatientInput } from '@/types/patient';

let _mockAccId = 1;
let _mockPatId = 1;

export async function findOrCreateAccount(mobile: string): Promise<Account> {
  if (!isSupabaseConfigured) {
    return { id: `mock-account-${_mockAccId++}`, mobile, created_at: new Date().toISOString() };
  }

  const { data: existing } = await supabase
    .from('accounts')
    .select('*')
    .eq('mobile', mobile)
    .maybeSingle();

  if (existing) return existing as Account;

  const { data, error } = await supabase
    .from('accounts')
    .insert({ mobile })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Account;
}

export async function getPatientsByAccount(accountId: string): Promise<Patient[]> {
  if (!isSupabaseConfigured) {
    return [];
  }

  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('account_id', accountId)
    .order('created_at');

  if (error) throw new Error(error.message);
  return (data ?? []) as Patient[];
}

export async function createPatient(input: PatientInput): Promise<Patient> {
  if (!isSupabaseConfigured) {
    return {
      id: `mock-patient-${_mockPatId++}`,
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

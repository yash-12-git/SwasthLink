import { createClient } from '@supabase/supabase-js';

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? '';
const key  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(url, key);

/** True when real Supabase credentials are present */
export const isSupabaseConfigured =
  url.startsWith('https://') && key.length > 20;

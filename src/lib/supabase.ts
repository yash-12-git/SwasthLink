import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? '';
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

/** True when real Supabase credentials are present */
export const isSupabaseConfigured =
  url.startsWith('https://') && key.length > 20;

// Only instantiate when credentials are present — avoids the
// "supabaseUrl is required" error during static pre-rendering.
let _client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!_client) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }
    _client = createClient(url, key);
  }
  return _client;
}

/** Convenience alias — only use in server actions / hooks where Supabase is confirmed available */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_t, prop) {
    return (getSupabaseClient() as never)[prop];
  },
});

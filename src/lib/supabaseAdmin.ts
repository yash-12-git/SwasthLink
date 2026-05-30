/**
 * Server-only Supabase admin client using the service role key.
 * Bypasses RLS — use only in server actions, never in client code.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

export const isAdminClientConfigured =
  url.startsWith('https://') && serviceKey.length > 20;

let _adminClient: SupabaseClient | null = null;

export function getAdminClient(): SupabaseClient {
  if (!_adminClient) {
    if (!isAdminClientConfigured) {
      throw new Error(
        'Supabase admin client requires SUPABASE_SERVICE_ROLE_KEY to be set.',
      );
    }
    _adminClient = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _adminClient;
}

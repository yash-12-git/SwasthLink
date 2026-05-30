'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { useAdminStore } from '@/store/adminStore';
import { isSupabaseConfigured, getSupabaseClient } from '@/lib/supabase';
import {
  getAdminQueueState,
  callNextInQueue,
  skipNextInQueue,
  toggleQueuePause,
  recallSkippedToken,
} from '@/services/adminService';

const POLL_INTERVAL_MS = 5_000; // fallback polling for new patient joins in mock mode

/**
 * Manages live admin queue state for the doctor dashboard.
 * - Loads initial state on mount
 * - In Supabase mode: subscribes to Realtime for patient joins
 * - In mock mode: polls every 5s for new entries (simulates patient arrivals)
 * - Exposes next(), skip(), pause(), recall() actions that return updated state
 */
export function useAdminQueue(queueId: string | undefined) {
  const { queueState, setQueueState, patchQueueState } = useAdminStore();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const pollRef    = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Load initial state ──────────────────────────────────────────────
  useEffect(() => {
    if (!queueId) return;
    getAdminQueueState(queueId).then((s) => {
      if (s) setQueueState(s);
    });
  }, [queueId, setQueueState]);

  // ── Realtime / polling ──────────────────────────────────────────────
  useEffect(() => {
    if (!queueId) return;

    const refresh = () => {
      getAdminQueueState(queueId).then((s) => { if (s) setQueueState(s); });
    };

    // Refresh when doctor returns to the tab (screen unlock, app switch back)
    const handleVisibility = () => { if (!document.hidden) refresh(); };
    document.addEventListener('visibilitychange', handleVisibility);

    if (isSupabaseConfigured) {
      const sb = getSupabaseClient();
      const channel = sb
        .channel(`admin-queue:${queueId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'queues', filter: `id=eq.${queueId}` },
          refresh,
        )
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'queue_entries', filter: `queue_id=eq.${queueId}` },
          refresh,
        )
        .subscribe();

      channelRef.current = channel;
      return () => {
        sb.removeChannel(channel);
        document.removeEventListener('visibilitychange', handleVisibility);
      };
    } else {
      // Mock mode: poll for new entries (simulating patients joining from patient app)
      pollRef.current = setInterval(() => {
        getAdminQueueState(queueId).then((s) => {
          if (s) patchQueueState(s);
        });
      }, POLL_INTERVAL_MS);
      return () => {
        if (pollRef.current) clearInterval(pollRef.current);
        document.removeEventListener('visibilitychange', handleVisibility);
      };
    }
  }, [queueId, setQueueState, patchQueueState]);

  // ── Actions ────────────────────────────────────────────────────────
  const next = useCallback(async () => {
    if (!queueId) return;
    const updated = await callNextInQueue(queueId);
    if (updated) setQueueState(updated);
  }, [queueId, setQueueState]);

  const skip = useCallback(async () => {
    if (!queueId) return;
    const updated = await skipNextInQueue(queueId);
    if (updated) setQueueState(updated);
  }, [queueId, setQueueState]);

  const pause = useCallback(async () => {
    if (!queueId) return;
    const updated = await toggleQueuePause(queueId);
    if (updated) setQueueState(updated);
  }, [queueId, setQueueState]);

  const recall = useCallback(async (tokenNumber: number) => {
    if (!queueId) return;
    const updated = await recallSkippedToken(queueId, tokenNumber);
    if (updated) setQueueState(updated);
  }, [queueId, setQueueState]);

  return { queueState, next, skip, pause, recall };
}

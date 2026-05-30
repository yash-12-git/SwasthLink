'use client';

import { useEffect, useRef } from 'react';
import { useQueueStore } from '@/store/queueStore';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';
import { getLiveQueueState } from '@/services/queueService';

const POLL_INTERVAL_MS = 12_000; // fallback for Android Chrome WebSocket drops

/**
 * Subscribes to realtime queue updates for a given queueId.
 *
 * Strategy (Supabase mode):
 *  1. WebSocket (postgres_changes) — instant on iOS and desktop.
 *  2. 12s fallback poll — catches Android Chrome WebSocket drops where the
 *     browser kills background WS connections to save battery.
 *  3. visibilitychange refresh — when the user returns to the tab after locking
 *     the screen or switching apps, immediately re-sync state.
 *
 * Each refresh fetches the full live state (not just a patch) so that
 * upcomingTokens, patientsAhead, and isDone are always consistent.
 */
export function useRealtimeQueue(queueId: string | undefined) {
  const setLive   = useQueueStore((s) => s.setLive);
  const patchLive = useQueueStore((s) => s.patchLive);
  const live      = useQueueStore((s) => s.live);
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Mock auto-advance ────────────────────────────────────────────────
  useEffect(() => {
    if (!live || isSupabaseConfigured) return;

    timerRef.current = setInterval(() => {
      const s = useQueueStore.getState().live;
      if (!s || s.doctorStatus === 'paused') return;
      if (s.currentToken >= s.yourToken - 3) return;
      const nextToken = s.currentToken + 1;
      patchLive({
        currentToken:      nextToken,
        currentTokenLabel: s.currentTokenLabel.replace(/\d+$/, String(nextToken).padStart(3, '0')),
        lastCallAt:        Date.now(),
        upcomingTokens:    s.upcomingTokens.filter((t) => t.token > nextToken),
      });
    }, 9000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [live, patchLive]);

  // ── Supabase realtime + Android fallback polling ─────────────────────
  useEffect(() => {
    if (!queueId || !isSupabaseConfigured) return;

    // Full refresh — replaces patchLive so upcomingTokens stays accurate
    const fetchFresh = () => {
      const current = useQueueStore.getState().live;
      if (!current) return;
      getLiveQueueState(
        current.queueId,
        current.yourToken,
        current.doctorName,
        current.departmentName,
        current.room,
      ).then(setLive).catch(() => {});
    };

    // WebSocket subscription — primary path (instant on iOS/desktop)
    const client  = getSupabaseClient();
    const channel = client
      .channel(`queue:${queueId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'queues', filter: `id=eq.${queueId}` },
        (payload) => {
          // Apply immediate partial patch for instant visual feedback…
          const row = payload.new as { current_token: number; is_paused: boolean; updated_at: string };
          patchLive({
            currentToken: row.current_token,
            doctorStatus: row.is_paused ? 'paused' : 'available',
            lastCallAt:   new Date(row.updated_at).getTime(),
          });
          // …then fetch full state to sync upcomingTokens
          fetchFresh();
        },
      )
      .subscribe();

    // Fallback poll — runs every 12s regardless of WS status.
    // Android Chrome kills WS connections in background tabs; this ensures
    // the patient sees the update within 12s even with a dead WebSocket.
    const pollTimer = setInterval(fetchFresh, POLL_INTERVAL_MS);

    // Visibility refresh — user returns to tab after locking screen or switching apps
    const handleVisibility = () => { if (!document.hidden) fetchFresh(); };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      client.removeChannel(channel);
      clearInterval(pollTimer);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [queueId, patchLive, setLive]);
}

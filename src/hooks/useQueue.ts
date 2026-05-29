'use client';

import { useEffect, useRef } from 'react';
import { useQueueStore } from '@/store/queueStore';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

/**
 * Subscribes to realtime queue updates for a given queueId.
 * In mock mode: auto-advances the token every 9 seconds.
 */
export function useRealtimeQueue(queueId: string | undefined) {
  const patchLive = useQueueStore((s) => s.patchLive);
  const live      = useQueueStore((s) => s.live);
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  // Mock auto-advance
  useEffect(() => {
    if (!live || isSupabaseConfigured) return;

    timerRef.current = setInterval(() => {
      const s = useQueueStore.getState().live;
      if (!s || s.doctorStatus === 'paused') return;
      // Keep at least 3 ahead of patient
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

  // Supabase realtime subscription
  useEffect(() => {
    if (!queueId || !isSupabaseConfigured) return;

    const channel = supabase
      .channel(`queue:${queueId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'queues', filter: `id=eq.${queueId}` },
        (payload) => {
          const row = payload.new as { current_token: number; is_paused: boolean; updated_at: string };
          patchLive({
            currentToken: row.current_token,
            doctorStatus: row.is_paused ? 'paused' : 'available',
            lastCallAt:   new Date(row.updated_at).getTime(),
          });
        },
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [queueId, patchLive]);
}

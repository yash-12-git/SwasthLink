import { create } from 'zustand';
import type { LiveQueueState, UpcomingToken } from '@/types/queue';

interface QueueStore {
  live: LiveQueueState | null;
  setLive: (state: LiveQueueState) => void;

  // Derived helpers
  patientsAhead:  () => number;
  estimatedWait:  () => number;   // minutes
  progressPct:    () => number;   // 0–100

  // Realtime patch — applied when a Supabase realtime event arrives
  patchLive: (patch: Partial<LiveQueueState>) => void;
}

export const useQueueStore = create<QueueStore>((set, get) => ({
  live: null,

  setLive: (live) => set({ live }),

  patchLive: (patch) =>
    set((s) => ({ live: s.live ? { ...s.live, ...patch } : s.live })),

  patientsAhead: () => {
    const s = get().live;
    if (!s) return 0;
    const idx = s.upcomingTokens.findIndex((t: UpcomingToken) => t.isYou);
    return idx === -1 ? 0 : idx;
  },

  estimatedWait: () => {
    const s = get().live;
    if (!s) return 0;
    return get().patientsAhead() * s.avgMinsPerPatient;
  },

  progressPct: () => {
    const s = get().live;
    if (!s) return 0;
    const startGap = s.yourToken - (s.yourToken - 6); // initial gap assumed ~6
    const served   = s.currentToken - (s.yourToken - startGap);
    return Math.min(100, Math.max(0, (served / startGap) * 100));
  },
}));

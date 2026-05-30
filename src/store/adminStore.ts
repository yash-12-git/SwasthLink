'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StaffSession, AdminQueueState } from '@/types/staff';

interface AdminStore {
  session: StaffSession | null;
  setSession: (s: StaffSession) => void;
  clearSession: () => void;

  queueState: AdminQueueState | null;
  setQueueState: (s: AdminQueueState) => void;
  patchQueueState: (patch: Partial<AdminQueueState>) => void;
}

export const useAdminStore = create<AdminStore>()(
  persist(
    (set) => ({
      session: null,
      queueState: null,

      setSession: (session) => set({ session }),
      clearSession: () => set({ session: null, queueState: null }),

      setQueueState: (queueState) => set({ queueState }),
      patchQueueState: (patch) =>
        set((s) => ({
          queueState: s.queueState ? { ...s.queueState, ...patch } : null,
        })),
    }),
    {
      name: 'ht-admin-v1',
      partialize: (s) => ({ session: s.session }),
    },
  ),
);

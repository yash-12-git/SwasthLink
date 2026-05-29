import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Patient } from '@/types/patient';
import type { Department } from '@/types/department';
import type { Doctor } from '@/types/doctor';
import type { QueueEntry } from '@/types/queue';
import type { Locale } from '@/lib/i18n';

interface PatientStore {
  // ── i18n ───────────────────────────────────────────────────────────
  locale: Locale;
  setLocale: (l: Locale) => void;

  // ── Registration form ──────────────────────────────────────────────
  patient: Partial<Patient>;
  setPatient: (p: Partial<Patient>) => void;

  // ── Selected department / doctor ───────────────────────────────────
  selectedDept: Department | null;
  setSelectedDept: (d: Department) => void;

  selectedDoctor: Doctor | null;
  setSelectedDoctor: (d: Doctor) => void;

  // ── Active queue entry (after joining) ────────────────────────────
  activeEntry: QueueEntry | null;
  setActiveEntry: (e: QueueEntry) => void;

  // ── Reset ─────────────────────────────────────────────────────────
  reset: () => void;
}

const initialState = {
  locale: 'en' as Locale,
  patient: {},
  selectedDept: null,
  selectedDoctor: null,
  activeEntry: null,
};

export const usePatientStore = create<PatientStore>()(
  persist(
    (set) => ({
      ...initialState,

      setLocale: (locale) => set({ locale }),

      setPatient:      (patient)      => set({ patient }),
      setSelectedDept: (selectedDept) => set({ selectedDept }),
      setSelectedDoctor:(selectedDoctor) => set({ selectedDoctor }),
      setActiveEntry:  (activeEntry)  => set({ activeEntry }),

      reset: () => set(initialState),
    }),
    {
      name: 'ht-patient',
      // Only persist locale + activeEntry across sessions
      partialize: (s) => ({ locale: s.locale, activeEntry: s.activeEntry }),
    },
  ),
);

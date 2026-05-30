import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Account } from '@/types/account';
import type { Patient } from '@/types/patient';
import type { Department } from '@/types/department';
import type { Doctor } from '@/types/doctor';
import type { QueueEntry } from '@/types/queue';
import type { Locale } from '@/lib/i18n';
import type { Hospital } from '@/types/hospital';

interface PatientStore {
  // ── i18n ─────────────────────────────────────────────────────────────
  locale: Locale;
  setLocale: (l: Locale) => void;

  // ── Hospital context (set from QR code ?h=slug param) ────────────────
  hospital: Partial<Hospital>;
  setHospital: (h: Partial<Hospital>) => void;

  // ── Mobile account (one per phone number, shared by family) ──────────
  account: Partial<Account>;
  setAccount: (a: Partial<Account>) => void;

  // ── Family members under this account ───────────────────────────────
  familyMembers: Patient[];
  setFamilyMembers: (members: Patient[]) => void;
  addFamilyMember: (p: Patient) => void;

  // ── Who is visiting today ────────────────────────────────────────────
  selectedPatient: Patient | null;
  setSelectedPatient: (p: Patient) => void;

  // ── Per-patient active queue entries ─────────────────────────────────
  // One active token per patient; key = patient.id
  activeEntries: Record<string, QueueEntry>;
  setActiveEntry: (patientId: string, entry: QueueEntry) => void;
  clearActiveEntry: (patientId: string) => void;

  // ── Navigation state (not persisted) ────────────────────────────────
  selectedDept: Department | null;
  setSelectedDept: (d: Department) => void;

  selectedDoctor: Doctor | null;
  setSelectedDoctor: (d: Doctor) => void;

  // ── Reset ─────────────────────────────────────────────────────────────
  clearAccount: () => void;
}

const initialState = {
  locale: 'en' as Locale,
  hospital: {} as Partial<Hospital>,
  account: {},
  familyMembers: [],
  selectedPatient: null,
  activeEntries: {},
  selectedDept: null,
  selectedDoctor: null,
};

export const usePatientStore = create<PatientStore>()(
  persist(
    (set) => ({
      ...initialState,

      setLocale: (locale) => set({ locale }),

      setHospital: (hospital) => set({ hospital }),

      setAccount: (account) => set({ account }),
      setFamilyMembers: (familyMembers) => set({ familyMembers }),
      addFamilyMember: (p) => set((s) => ({ familyMembers: [...s.familyMembers, p] })),

      setSelectedPatient: (selectedPatient) => set({ selectedPatient }),

      setActiveEntry: (patientId, entry) =>
        set((s) => ({ activeEntries: { ...s.activeEntries, [patientId]: entry } })),
      clearActiveEntry: (patientId) =>
        set((s) => {
          const { [patientId]: _unused, ...rest } = s.activeEntries; // eslint-disable-line @typescript-eslint/no-unused-vars
          return { activeEntries: rest };
        }),

      setSelectedDept:   (selectedDept)   => set({ selectedDept }),
      setSelectedDoctor: (selectedDoctor) => set({ selectedDoctor }),

      clearAccount: () => set(initialState),
    }),
    {
      name: 'ht-patient-v2',
      partialize: (s) => ({
        locale:          s.locale,
        hospital:        s.hospital,
        account:         s.account,
        familyMembers:   s.familyMembers,
        selectedPatient: s.selectedPatient,
        activeEntries:   s.activeEntries,
      }),
    },
  ),
);

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

  // ── Per-hospital, per-patient active queue entries ───────────────────
  // Outer key = hospital.id; inner key = patient.id
  // Keeps Hospital A's tokens invisible when the user opens Hospital B's page
  activeEntries: Record<string, Record<string, QueueEntry>>;
  setActiveEntry: (hospitalId: string, patientId: string, entry: QueueEntry) => void;
  clearActiveEntry: (hospitalId: string, patientId: string) => void;

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

      setActiveEntry: (hospitalId, patientId, entry) =>
        set((s) => ({
          activeEntries: {
            ...s.activeEntries,
            [hospitalId]: { ...s.activeEntries[hospitalId], [patientId]: entry },
          },
        })),
      clearActiveEntry: (hospitalId, patientId) =>
        set((s) => {
          const hospitalEntries = { ...s.activeEntries[hospitalId] };
          delete hospitalEntries[patientId];
          return { activeEntries: { ...s.activeEntries, [hospitalId]: hospitalEntries } };
        }),

      setSelectedDept:   (selectedDept)   => set({ selectedDept }),
      setSelectedDoctor: (selectedDoctor) => set({ selectedDoctor }),

      clearAccount: () => set(initialState),
    }),
    {
      name: 'ht-patient-v3',
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

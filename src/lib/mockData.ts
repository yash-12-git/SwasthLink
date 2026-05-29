import type { Department } from '@/types/department';
import type { Doctor } from '@/types/doctor';
import type { LiveQueueState } from '@/types/queue';

export const MOCK_DEPARTMENTS: Department[] = [
  { id: 'general', name: 'General OPD',   nameHi: 'सामान्य ओपीडी', icon: 'ShieldCheck',   color: '#1565C0', bg: '#E3F2FD', activeQueue: 16, avgWaitMins: 22 },
  { id: 'ortho',   name: 'Orthopedics',   nameHi: 'हड्डी रोग',     icon: 'Bone',          color: '#6A3FB8', bg: '#EFE8FA', activeQueue: 8,  avgWaitMins: 18 },
  { id: 'ent',     name: 'ENT',           nameHi: 'कान-नाक-गला',   icon: 'Ear',           color: '#0E7C7B', bg: '#E2F4F3', activeQueue: 5,  avgWaitMins: 11 },
  { id: 'cardio',  name: 'Cardiology',    nameHi: 'हृदय रोग',       icon: 'Heart',         color: '#D32F2F', bg: '#FFEBEE', activeQueue: 14, avgWaitMins: 30 },
  { id: 'skin',    name: 'Dermatology',   nameHi: 'त्वचा रोग',      icon: 'User',          color: '#ED6C02', bg: '#FFF3E0', activeQueue: 6,  avgWaitMins: 15 },
];

export const MOCK_DOCTORS: Record<string, Doctor[]> = {
  general: [
    { id: 'sharma', name: 'Dr. A. Sharma', specialty: 'General Physician', room: 'Room 4', department_id: 'general', status: 'available', queue_count: 16, avg_wait_mins: 20, synced: true },
    { id: 'nair',   name: 'Dr. P. Nair',   specialty: 'General Physician', room: 'Room 5', department_id: 'general', status: 'busy',      queue_count: 9,  avg_wait_mins: 36 },
    { id: 'khan',   name: 'Dr. M. Khan',   specialty: 'Family Medicine',   room: 'Room 6', department_id: 'general', status: 'paused',    queue_count: 4,  avg_wait_mins: null },
  ],
  ortho: [
    { id: 'verma',  name: 'Dr. R. Verma',  specialty: 'Orthopedic Surgeon', room: 'Room 2', department_id: 'ortho', status: 'available', queue_count: 8,  avg_wait_mins: 18 },
    { id: 'iyer',   name: 'Dr. S. Iyer',   specialty: 'Orthopedics',        room: 'Room 3', department_id: 'ortho', status: 'busy',      queue_count: 12, avg_wait_mins: 28 },
  ],
  ent: [
    { id: 'rao',    name: 'Dr. K. Rao',    specialty: 'ENT Specialist', room: 'Room 8', department_id: 'ent', status: 'available', queue_count: 5, avg_wait_mins: 11 },
  ],
  cardio: [
    { id: 'gupta',  name: 'Dr. M. Gupta',  specialty: 'Cardiologist', room: 'Room 12', department_id: 'cardio', status: 'available', queue_count: 14, avg_wait_mins: 30 },
    { id: 'mehta',  name: 'Dr. S. Mehta',  specialty: 'Cardiologist', room: 'Room 13', department_id: 'cardio', status: 'paused',    queue_count: 6,  avg_wait_mins: null },
  ],
  skin: [
    { id: 'bose',   name: 'Dr. A. Bose',   specialty: 'Dermatologist', room: 'Room 7', department_id: 'skin', status: 'available', queue_count: 6, avg_wait_mins: 15 },
  ],
};

const FIRST = ['Asha','Ramesh','Sunita','Imran','Lakshmi','Vikram','Fatima','Raju','Meena','Gopal','Priya','Arjun'];
const LAST  = ['Devi','Kumar','Sharma','Khan','Reddy','Patel','Nair','Singh'];

export function mockName(i: number) {
  return `${FIRST[i % FIRST.length]} ${LAST[(i * 3) % LAST.length]}`;
}

export function fmtToken(prefix: string, n: number): string {
  return `${prefix}-${String(n).padStart(3, '0')}`;
}

/** Build a mock LiveQueueState so the track screen works without Supabase. */
export function buildMockLiveQueue(
  doctorId: string,
  doctorName: string,
  departmentName: string,
  room: string,
  yourToken: number,
  prefix = 'G',
): LiveQueueState {
  const serving = yourToken - 5;
  const lastIssued = yourToken + 3;

  const upcomingTokens = Array.from(
    { length: lastIssued - serving },
    (_, i) => {
      const token = serving + i + 1;
      return { token, label: fmtToken(prefix, token), isYou: token === yourToken };
    },
  );

  return {
    queueId: 'mock-queue',
    doctorId,
    doctorName,
    departmentName,
    room,
    currentToken: serving,
    currentTokenLabel: fmtToken(prefix, serving),
    yourToken,
    yourTokenLabel: fmtToken(prefix, yourToken),
    doctorStatus: 'available',
    avgMinsPerPatient: 4,
    lastCallAt: Date.now(),
    upcomingTokens,
  };
}

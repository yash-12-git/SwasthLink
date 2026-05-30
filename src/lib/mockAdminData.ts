/**
 * In-memory mock data for admin/doctor flow.
 * Mutated by adminService server actions when Supabase is not configured.
 */
import type { AdminQueueState, AdminQueueEntry, DoctorQueueSummary, StaffRole } from '@/types/staff';

function fmtLabel(prefix: string, n: number) {
  return `${prefix}-${String(n).padStart(3, '0')}`;
}

const NAMES = [
  'Asha Devi', 'Ramesh Kumar', 'Sunita Sharma', 'Imran Khan',
  'Priya Verma', 'Raj Singh', 'Meera Nair', 'Suresh Patel',
  'Kavita Joshi', 'Arjun Das',
];

function makeEntries(prefix: string, startToken: number, count: number): AdminQueueEntry[] {
  return Array.from({ length: count }, (_, i) => ({
    token: startToken + i,
    label: fmtLabel(prefix, startToken + i),
    patientName: NAMES[(startToken + i) % NAMES.length],
    age: 20 + ((startToken + i * 7) % 60),
    gender: (['M', 'F', 'O'] as const)[(startToken + i) % 3],
  }));
}

// Keyed by staffId (e.g. 'dr.sharma') for easy lookup in mock mode
export const mockQueueStates: Record<string, AdminQueueState> = {
  'dr.sharma': {
    queueId:          'mock-queue-sharma',
    doctorId:         'mock-doctor-sharma',
    doctorName:       'Dr. A. Sharma',
    room:             'Room 4',
    departmentId:     'general',
    departmentName:   'General OPD',
    hospitalId:       'mock-hospital',
    currentToken:     11,
    currentTokenLabel: fmtLabel('G', 11),
    isPaused:         false,
    skipped:          [],
    lastCallAt:       Date.now() - 45_000,
    avgMins:          4,
    upcoming:         makeEntries('G', 12, 8),
    seenToday:        11 - 1,
  },
  'dr.verma': {
    queueId:          'mock-queue-verma',
    doctorId:         'mock-doctor-verma',
    doctorName:       'Dr. R. Verma',
    room:             'Room 8',
    departmentId:     'ortho',
    departmentName:   'Orthopedics',
    hospitalId:       'mock-hospital',
    currentToken:     6,
    currentTokenLabel: fmtLabel('O', 6),
    isPaused:         false,
    skipped:          [],
    lastCallAt:       Date.now() - 120_000,
    avgMins:          5,
    upcoming:         makeEntries('O', 7, 5),
    seenToday:        6 - 1,
  },
  'dr.rao': {
    queueId:          'mock-queue-rao',
    doctorId:         'mock-doctor-rao',
    doctorName:       'Dr. S. Rao',
    room:             'Room 12',
    departmentId:     'ent',
    departmentName:   'ENT',
    hospitalId:       'mock-hospital',
    currentToken:     4,
    currentTokenLabel: fmtLabel('E', 4),
    isPaused:         true,
    skipped:          [],
    lastCallAt:       Date.now() - 300_000,
    avgMins:          6,
    upcoming:         makeEntries('E', 5, 3),
    seenToday:        4 - 1,
  },
  'dr.gupta': {
    queueId:          'mock-queue-gupta',
    doctorId:         'mock-doctor-gupta',
    doctorName:       'Dr. M. Gupta',
    room:             'Room 2',
    departmentId:     'cardio',
    departmentName:   'Cardiology',
    hospitalId:       'mock-hospital',
    currentToken:     9,
    currentTokenLabel: fmtLabel('C', 9),
    isPaused:         false,
    skipped:          [],
    lastCallAt:       Date.now() - 180_000,
    avgMins:          7,
    upcoming:         makeEntries('C', 10, 6),
    seenToday:        9 - 1,
  },
};

export const MOCK_STAFF = [
  {
    id: 'staff-1',
    staffId: 'dr.sharma',
    password: 'password',
    name: 'Dr. A. Sharma',
    role: 'doctor' as StaffRole,
    hospitalId: 'mock-hospital',
    hospitalName: 'District General Hospital',
    hospitalSlug: 'dgh',
    doctorId: 'mock-doctor-sharma',
    queueId: 'mock-queue-sharma',
    queueKey: 'dr.sharma',
    room: 'Room 4',
    departmentId: 'general',
    departmentName: 'General OPD',
  },
  {
    id: 'staff-2',
    staffId: 'dr.verma',
    password: 'password',
    name: 'Dr. R. Verma',
    role: 'doctor' as StaffRole,
    hospitalId: 'mock-hospital',
    hospitalName: 'District General Hospital',
    hospitalSlug: 'dgh',
    doctorId: 'mock-doctor-verma',
    queueId: 'mock-queue-verma',
    queueKey: 'dr.verma',
    room: 'Room 8',
    departmentId: 'ortho',
    departmentName: 'Orthopedics',
  },
  {
    id: 'staff-3',
    staffId: 'dr.rao',
    password: 'password',
    name: 'Dr. S. Rao',
    role: 'doctor' as StaffRole,
    hospitalId: 'mock-hospital',
    hospitalName: 'District General Hospital',
    hospitalSlug: 'dgh',
    doctorId: 'mock-doctor-rao',
    queueId: 'mock-queue-rao',
    queueKey: 'dr.rao',
    room: 'Room 12',
    departmentId: 'ent',
    departmentName: 'ENT',
  },
  {
    id: 'staff-4',
    staffId: 'dr.gupta',
    password: 'password',
    name: 'Dr. M. Gupta',
    role: 'doctor' as StaffRole,
    hospitalId: 'mock-hospital',
    hospitalName: 'District General Hospital',
    hospitalSlug: 'dgh',
    doctorId: 'mock-doctor-gupta',
    queueId: 'mock-queue-gupta',
    queueKey: 'dr.gupta',
    room: 'Room 2',
    departmentId: 'cardio',
    departmentName: 'Cardiology',
  },
  {
    id: 'staff-5',
    staffId: 'admin',
    password: 'admin123',
    name: 'Hospital Admin',
    role: 'admin' as StaffRole,
    hospitalId: 'mock-hospital',
    hospitalName: 'District General Hospital',
    hospitalSlug: 'dgh',
  },
] as const;

/** Returns all active queues (for admin overview / TV display) */
export function getAllMockQueues(): DoctorQueueSummary[] {
  return Object.values(mockQueueStates).map((q) => ({
    queueId:          q.queueId,
    doctorId:         q.doctorId,
    doctorName:       q.doctorName,
    room:             q.room,
    departmentId:     q.departmentId,
    departmentName:   q.departmentName,
    currentToken:     q.currentToken,
    currentTokenLabel: q.currentTokenLabel,
    isPaused:         q.isPaused,
    queueLength:      q.upcoming.length,
    lastCallAt:       q.lastCallAt,
  }));
}

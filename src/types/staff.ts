export type StaffRole = 'doctor' | 'admin' | 'superadmin';

export interface StaffUser {
  id: string;
  hospital_id: string;
  staff_id: string;
  name: string;
  role: StaffRole;
  doctor_id?: string;
  created_at?: string;
}

/** Serialisable session stored in localStorage via adminStore */
export interface StaffSession {
  staffUserId: string;
  staffId: string;
  name: string;
  role: StaffRole;
  hospitalId: string;
  hospitalName: string;
  hospitalSlug: string;
  // Doctor-specific (null for admin/superadmin)
  doctorId?: string;
  queueId?: string;
  room?: string;
  departmentId?: string;
  departmentName?: string;
}

export interface AdminQueueEntry {
  token: number;
  label: string;
  patientName: string;
  age?: number;
  gender?: string;
}

export interface AdminQueueState {
  queueId: string;
  doctorId: string;
  doctorName: string;
  room: string;
  departmentId: string;
  departmentName: string;
  hospitalId: string;
  currentToken: number;
  currentTokenLabel: string;
  isPaused: boolean;
  skipped: Array<{ token: number; label: string }>;
  lastCallAt: number;
  avgMins: number;
  upcoming: AdminQueueEntry[];
  seenToday: number;
}

export interface DoctorQueueSummary {
  queueId: string;
  doctorId: string;
  doctorName: string;
  room: string;
  departmentId: string;
  departmentName: string;
  currentToken: number;
  currentTokenLabel: string;
  isPaused: boolean;
  queueLength: number;
  lastCallAt: number;
}

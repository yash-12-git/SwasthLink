export type QueueEntryStatus = 'waiting' | 'serving' | 'done' | 'skipped';

export interface Queue {
  id: string;
  doctor_id: string;
  current_token: number;
  is_paused: boolean;
  updated_at: string;
}

export interface QueueEntry {
  id: string;
  patient_id: string;
  queue_id: string;
  doctor_id: string;
  department_id: string;
  token_number: number;
  token_label: string;    // e.g. "G-047"
  status: QueueEntryStatus;
  created_at: string;
}

export interface LiveQueueState {
  queueId: string;
  doctorId: string;
  doctorName: string;
  departmentName: string;
  room: string;
  currentToken: number;
  currentTokenLabel: string;
  yourToken: number;
  yourTokenLabel: string;
  doctorStatus: 'available' | 'paused';
  avgMinsPerPatient: number;
  lastCallAt: number;      // Date.now() timestamp
  upcomingTokens: UpcomingToken[];
}

export interface UpcomingToken {
  token: number;
  label: string;
  isYou: boolean;
}

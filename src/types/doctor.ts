export type DoctorStatus = 'available' | 'busy' | 'paused';

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  room: string;
  department_id: string;
  status: DoctorStatus;
  queue_count: number;
  avg_wait_mins: number | null;
  synced?: boolean;         // true → this doctor's queue feeds the realtime store
}

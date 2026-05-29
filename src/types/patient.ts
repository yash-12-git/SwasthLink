export type Gender = 'M' | 'F' | 'O';

export interface Patient {
  id: string;
  name: string;
  mobile: string;
  age: number;
  gender: Gender;
  created_at?: string;
}

export type PatientInput = Omit<Patient, 'id' | 'created_at'>;

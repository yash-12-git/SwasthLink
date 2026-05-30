export type Gender = 'M' | 'F' | 'O';

export interface Patient {
  id: string;
  account_id: string;
  name: string;
  age: number;
  gender: Gender;
  created_at?: string;
}

export type PatientInput = {
  account_id: string;
  name: string;
  age: number;
  gender: Gender;
};

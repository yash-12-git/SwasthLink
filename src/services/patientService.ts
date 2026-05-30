'use server';

// Patient operations are now handled by accountService.
// This file is kept as a re-export shim so any remaining imports don't break.
export { createPatient, getPatientsByAccount } from '@/services/accountService';

'use server';

import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { isAdminClientConfigured, getAdminClient } from '@/lib/supabaseAdmin';
import { MOCK_STAFF, mockQueueStates } from '@/lib/mockAdminData';
import type { StaffSession } from '@/types/staff';

export interface LoginResult {
  session: StaffSession | null;
  error?: string;
}

/**
 * Authenticates a staff user. Works in both mock and Supabase modes.
 * In Supabase mode, verifies against staff_users table (bcrypt via pgcrypto).
 */
export async function loginStaff(staffId: string, password: string): Promise<LoginResult> {
  if (!isSupabaseConfigured || !isAdminClientConfigured) {
    // Mock mode: plain-text password check for demo purposes
    const user = MOCK_STAFF.find(
      (s) => s.staffId === staffId && s.password === password,
    );
    if (!user) return { session: null, error: 'Invalid staff ID or password.' };

    const session: StaffSession = {
      staffUserId:    user.id,
      staffId:        user.staffId,
      name:           user.name,
      role:           user.role,
      hospitalId:     user.hospitalId,
      hospitalName:   user.hospitalName,
      hospitalSlug:   user.hospitalSlug,
      doctorId:       'doctorId' in user ? user.doctorId : undefined,
      queueId:        'queueId' in user ? user.queueId : undefined,
      room:           'room' in user ? user.room : undefined,
      departmentId:   'departmentId' in user ? user.departmentId : undefined,
      departmentName: 'departmentName' in user ? user.departmentName : undefined,
    };
    return { session };
  }

  // Supabase mode: lookup in staff_users, verify hashed_password via pgcrypto
  const admin = getAdminClient();
  const { data: staffUser, error } = await admin
    .from('staff_users')
    .select(`
      id, staff_id, name, role,
      hospital_id, hospitals(slug, name),
      doctor_id,
      doctors(room, department_id, departments(name))
    `)
    .eq('staff_id', staffId)
    .single();

  if (error || !staffUser) {
    return { session: null, error: 'Invalid staff ID or password.' };
  }

  // Verify password using pgcrypto crypt()
  const { data: pwCheck } = await admin.rpc('verify_staff_password', {
    p_staff_id: staffId,
    p_password: password,
  });
  if (!pwCheck) return { session: null, error: 'Invalid staff ID or password.' };

  const hospital = (staffUser.hospitals as unknown as { slug: string; name: string } | null);
  const doctor   = (staffUser.doctors  as unknown as { room: string; department_id: string; departments: { name: string } } | null);

  // Fetch the queue id for this doctor
  let queueId: string | undefined;
  if (staffUser.doctor_id) {
    const { data: q } = await supabase
      .from('queues')
      .select('id')
      .eq('doctor_id', staffUser.doctor_id)
      .single();
    queueId = q?.id;
  }

  const session: StaffSession = {
    staffUserId:    staffUser.id,
    staffId:        staffUser.staff_id,
    name:           staffUser.name,
    role:           staffUser.role as StaffSession['role'],
    hospitalId:     staffUser.hospital_id,
    hospitalName:   hospital?.name ?? 'Hospital',
    hospitalSlug:   hospital?.slug ?? '',
    doctorId:       staffUser.doctor_id ?? undefined,
    queueId,
    room:           doctor?.room ?? undefined,
    departmentId:   doctor?.department_id ?? undefined,
    departmentName: doctor?.departments?.name ?? undefined,
  };

  return { session };
}

/** Retrieves a staff member's profile by staffUserId. Used for session refresh. */
export async function getStaffProfile(staffUserId: string): Promise<StaffSession | null> {
  if (!isSupabaseConfigured || !isAdminClientConfigured) {
    const user = MOCK_STAFF.find((s) => s.id === staffUserId);
    if (!user) return null;
    return {
      staffUserId:    user.id,
      staffId:        user.staffId,
      name:           user.name,
      role:           user.role,
      hospitalId:     user.hospitalId,
      hospitalName:   user.hospitalName,
      hospitalSlug:   user.hospitalSlug,
      doctorId:       'doctorId' in user ? user.doctorId : undefined,
      queueId:        'queueId' in user ? user.queueId : undefined,
      room:           'room' in user ? user.room : undefined,
      departmentId:   'departmentId' in user ? user.departmentId : undefined,
      departmentName: 'departmentName' in user ? user.departmentName : undefined,
    };
  }
  return null;
}

'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Calendar, ArrowRight } from 'lucide-react';
import { MobileLayout }    from '@/components/layout/MobileLayout';
import { BackBar }         from '@/components/layout/BackBar';
import { BottomNav }       from '@/components/layout/BottomNav';
import { TextField, SegmentedField } from '@/components/ui/Field';
import { Button }          from '@/components/ui/Button';
import { colors }          from '@/theme';
import { usePatientStore } from '@/store/patientStore';
import { createPatient }   from '@/services/accountService';
import type { Gender }     from '@/types/patient';

const schema = z.object({
  name:   z.string().min(2, 'Name must be at least 2 characters'),
  age:    z.string().regex(/^([1-9]|[1-9]\d|1[01]\d|120)$/, 'Enter a valid age (1–120)'),
  gender: z.enum(['M', 'F', 'O'], { required_error: 'Please select gender' }),
});

type FormData = { name: string; age: string; gender: Gender };

export default function AddPatientPage() {
  const router             = useRouter();
  const account            = usePatientStore((s) => s.account);
  const addFamilyMember    = usePatientStore((s) => s.addFamilyMember);
  const setSelectedPatient = usePatientStore((s) => s.setSelectedPatient);

  // Guard: must be logged in
  useEffect(() => {
    if (!account.id) router.replace('/register');
  }, [account.id, router]);

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const genderValue = watch('gender');

  const onSubmit = async (data: FormData) => {
    const patient = await createPatient({
      account_id: account.id!,
      name: data.name,
      age: parseInt(data.age),
      gender: data.gender,
    });
    addFamilyMember(patient);
    setSelectedPatient(patient);
    router.push('/family');
  };

  if (!account.id) return null;

  return (
    <MobileLayout>
      <BackBar title="Add Patient" subtitle="New family member" href="/family" />

      <form onSubmit={handleSubmit(onSubmit)} style={{ flex: 1, display: 'flex', flexDirection: 'column' }} noValidate>
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 16px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <p style={{ fontSize: 14, color: colors.ink500, fontWeight: 600, lineHeight: 1.4, margin: 0 }}>
            Adding a patient to account <strong>{account.mobile}</strong>. No need to re-enter the mobile number.
          </p>

          <TextField
            label="Full Name"
            placeholder="e.g. Rajesh Sharma"
            icon={<User size={20} />}
            autoFocus
            error={errors.name?.message}
            {...register('name')}
            onChange={(v) => setValue('name', v, { shouldValidate: true })}
            value={watch('name') ?? ''}
          />

          <TextField
            label="Age"
            placeholder="e.g. 45"
            icon={<Calendar size={20} />}
            inputMode="numeric"
            error={errors.age?.message}
            {...register('age')}
            onChange={(v) => setValue('age', v.replace(/\D/g, '').slice(0, 3), { shouldValidate: true })}
            value={watch('age') ?? ''}
          />

          <SegmentedField
            label="Gender"
            value={genderValue}
            error={errors.gender?.message}
            options={[
              { value: 'F', label: 'Female', sub: 'Female' },
              { value: 'M', label: 'Male',   sub: 'Male'   },
              { value: 'O', label: 'Other',  sub: 'Other'  },
            ]}
            onChange={(v) => setValue('gender', v as Gender, { shouldValidate: true })}
          />
        </div>

        <div style={{ padding: '12px 16px', borderTop: `1px solid ${colors.border}`, background: colors.surface, flexShrink: 0 }}>
          <Button type="submit" full size="lg" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : <>Add Patient <ArrowRight size={20} /></>}
          </Button>
        </div>
      </form>

      <BottomNav />
    </MobileLayout>
  );
}

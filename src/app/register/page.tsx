'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Phone, Calendar, ArrowRight } from 'lucide-react';
import { MobileLayout }    from '@/components/layout/MobileLayout';
import { BackBar }         from '@/components/layout/BackBar';
import { BottomNav }       from '@/components/layout/BottomNav';
import { TextField, SegmentedField } from '@/components/ui/Field';
import { Button }          from '@/components/ui/Button';
import { colors }          from '@/theme';
import { usePatientStore } from '@/store/patientStore';
import { useTranslation }  from '@/hooks/useTranslation';
import type { Gender }     from '@/types/patient';

function buildSchema(t: (k: string) => string) {
  return z.object({
    name:   z.string().min(2, t('register.errors.nameMin')),
    mobile: z.string().regex(/^\d{10}$/, t('register.errors.mobileInvalid')),
    age:    z.string().regex(/^([1-9]|[1-9]\d|1[01]\d|120)$/, t('register.errors.ageInvalid')),
    gender: z.enum(['M', 'F', 'O'], { required_error: t('register.errors.genderRequired') }),
  });
}

type FormData = { name: string; mobile: string; age: string; gender: Gender };

export default function RegisterPage() {
  const router      = useRouter();
  const { t }       = useTranslation();
  const setPatient  = usePatientStore((s) => s.setPatient);

  const schema = buildSchema(t);
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const genderValue = watch('gender');

  const onSubmit = (data: FormData) => {
    setPatient({ name: data.name, mobile: data.mobile, age: parseInt(data.age), gender: data.gender });
    router.push('/department');
  };

  return (
    <MobileLayout>
      <BackBar
        title={t('register.title')}
        subtitle={t('register.stepLabel')}
        href="/"
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
        noValidate
      >
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 16px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <p style={{ fontSize: 14, color: colors.ink500, fontWeight: 600, lineHeight: 1.4, margin: 0 }}>
            {t('register.subtitle')}
          </p>

          <TextField
            label={t('register.name')}
            placeholder={t('register.namePlaceholder')}
            icon={<User size={20} />}
            autoFocus
            error={errors.name?.message}
            {...register('name')}
            onChange={(v) => setValue('name', v, { shouldValidate: true })}
            value={watch('name') ?? ''}
          />

          <TextField
            label={t('register.mobile')}
            placeholder={t('register.mobilePlaceholder')}
            icon={<Phone size={20} />}
            inputMode="numeric"
            hint={t('register.mobileHint')}
            error={errors.mobile?.message}
            {...register('mobile')}
            onChange={(v) => setValue('mobile', v.replace(/\D/g, '').slice(0, 10), { shouldValidate: true })}
            value={watch('mobile') ?? ''}
          />

          <TextField
            label={t('register.age')}
            placeholder={t('register.agePlaceholder')}
            icon={<Calendar size={20} />}
            inputMode="numeric"
            error={errors.age?.message}
            {...register('age')}
            onChange={(v) => setValue('age', v.replace(/\D/g, '').slice(0, 3), { shouldValidate: true })}
            value={watch('age') ?? ''}
          />

          <SegmentedField
            label={t('register.gender')}
            value={genderValue}
            error={errors.gender?.message}
            options={[
              { value: 'F', label: t('register.female'), sub: 'Female' },
              { value: 'M', label: t('register.male'),   sub: 'Male'   },
              { value: 'O', label: t('register.other'),  sub: 'Other'  },
            ]}
            onChange={(v) => setValue('gender', v as Gender, { shouldValidate: true })}
          />
        </div>

        <div style={{ padding: '12px 16px', borderTop: `1px solid ${colors.border}`, background: colors.surface, flexShrink: 0 }}>
          <Button type="submit" full size="lg">
            {t('register.submit')} <ArrowRight size={20} />
          </Button>
        </div>
      </form>

      <BottomNav />
    </MobileLayout>
  );
}

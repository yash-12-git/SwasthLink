'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MobileLayout }     from '@/components/layout/MobileLayout';
import { BackBar }          from '@/components/layout/BackBar';
import { BottomNav }        from '@/components/layout/BottomNav';
import { DepartmentCard }   from '@/components/patient/DepartmentCard';
import { colors }           from '@/theme';
import { MOCK_DEPARTMENTS } from '@/lib/mockData';
import { usePatientStore }  from '@/store/patientStore';
import { useTranslation }   from '@/hooks/useTranslation';

export default function DepartmentPage() {
  const router         = useRouter();
  const { t }          = useTranslation();
  const setSelectedDept = usePatientStore((s) => s.setSelectedDept);

  const handleSelect = (deptId: string) => {
    const dept = MOCK_DEPARTMENTS.find((d) => d.id === deptId);
    if (dept) {
      setSelectedDept(dept);
      router.push(`/doctor/${deptId}`);
    }
  };

  return (
    <MobileLayout>
      <BackBar
        title={t('department.title')}
        subtitle={t('department.stepLabel')}
        href="/register"
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={{ fontSize: 13.5, color: colors.ink500, fontWeight: 600, margin: 0 }}>
          {t('department.subtitle')}
        </p>
        {MOCK_DEPARTMENTS.map((dept) => (
          <DepartmentCard key={dept.id} dept={dept} onClick={() => handleSelect(dept.id)} />
        ))}
      </div>

      <BottomNav />
    </MobileLayout>
  );
}

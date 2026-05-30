'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MobileLayout }     from '@/components/layout/MobileLayout';
import { BackBar }          from '@/components/layout/BackBar';
import { BottomNav }        from '@/components/layout/BottomNav';
import { DepartmentCard }   from '@/components/patient/DepartmentCard';
import { colors }           from '@/theme';
import { MOCK_DEPARTMENTS } from '@/lib/mockData';
import { usePatientStore }  from '@/store/patientStore';
import { useTranslation }   from '@/hooks/useTranslation';
import type { Department }  from '@/types/department';

export default function DepartmentPage() {
  const router             = useRouter();
  const { t }              = useTranslation();
  const setSelectedDept    = usePatientStore((s) => s.setSelectedDept);
  const selectedPatient    = usePatientStore((s) => s.selectedPatient);
  const account            = usePatientStore((s) => s.account);
  const setSelectedPatient = usePatientStore((s) => s.setSelectedPatient);

  const [departments, setDepartments] = useState<Department[]>(MOCK_DEPARTMENTS);
  const [loading, setLoading]         = useState(true);

  // Guard: need both account and selected patient
  useEffect(() => {
    if (!account.id) { router.replace('/register'); return; }
    if (!selectedPatient) { router.replace('/family'); return; }
  }, [account.id, selectedPatient, router]);

  useEffect(() => {
    import('@/services/departmentService')
      .then(({ getDepartments }) => getDepartments())
      .then(setDepartments)
      .catch(() => setDepartments(MOCK_DEPARTMENTS))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (dept: Department) => {
    setSelectedDept(dept);
    router.push(`/doctor/${dept.id}`);
  };

  const handleChangePatient = () => {
    setSelectedPatient(null as unknown as import('@/types/patient').Patient);
    router.push('/family');
  };

  if (!account.id || !selectedPatient) return null;

  return (
    <MobileLayout>
      <BackBar
        title={t('department.title')}
        subtitle={t('department.stepLabel')}
        href="/"
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Patient context + change option */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontSize: 13.5, color: colors.ink500, fontWeight: 600, margin: 0 }}>
            {t('department.subtitle')}
          </p>
          <button
            onClick={handleChangePatient}
            style={{ background: 'none', border: 'none', color: colors.primary, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', padding: '2px 0', flexShrink: 0 }}
          >
            Not {selectedPatient.name.split(' ')[0]}?
          </button>
        </div>

        {loading ? (
          <p style={{ color: colors.ink400, fontSize: 14, textAlign: 'center', marginTop: 32 }}>Loading…</p>
        ) : (
          departments.map((dept) => (
            <DepartmentCard key={dept.id} dept={dept} onClick={() => handleSelect(dept)} />
          ))
        )}
      </div>

      <BottomNav />
    </MobileLayout>
  );
}

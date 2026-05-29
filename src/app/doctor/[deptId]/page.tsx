'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MobileLayout }     from '@/components/layout/MobileLayout';
import { BackBar }          from '@/components/layout/BackBar';
import { BottomNav }        from '@/components/layout/BottomNav';
import { DoctorCard }       from '@/components/patient/DoctorCard';
import { colors }           from '@/theme';
import { MOCK_DEPARTMENTS, MOCK_DOCTORS } from '@/lib/mockData';
import { usePatientStore }  from '@/store/patientStore';
import { useTranslation }   from '@/hooks/useTranslation';
import type { Doctor }      from '@/types/doctor';

export default function DoctorPage() {
  const router  = useRouter();
  const params  = useParams<{ deptId: string }>();
  const deptId  = params.deptId;

  const { t }           = useTranslation();
  const setDoctor       = usePatientStore((s) => s.setSelectedDoctor);
  const setActiveEntry  = usePatientStore((s) => s.setActiveEntry);
  const patient         = usePatientStore((s) => s.patient);
  const [loading, setLoading] = useState(false);

  const dept    = MOCK_DEPARTMENTS.find((d) => d.id === deptId);
  const doctors = MOCK_DOCTORS[deptId] ?? MOCK_DOCTORS.general;

  const handleJoin = async (doc: Doctor) => {
    setLoading(true);
    try {
      setDoctor(doc);

      // Lazy import so this stays client-side safe
      const { joinQueue }   = await import('@/services/queueService');
      const { buildMockLiveQueue } = await import('@/lib/mockData');
      const { useQueueStore }      = await import('@/store/queueStore');

      const entry = await joinQueue({
        patientId:      patient.id ?? 'mock-patient',
        doctorId:       doc.id,
        departmentId:   deptId,
        doctorName:     doc.name,
        departmentName: dept?.name ?? deptId,
        room:           doc.room,
      });

      setActiveEntry(entry);

      // Pre-seed live queue store so confirm / track screens work immediately
      const live = buildMockLiveQueue(doc.id, doc.name, dept?.name ?? deptId, doc.room, entry.token_number);
      useQueueStore.getState().setLive(live);

      router.push('/confirm');
    } catch (err) {
      console.error('Join queue failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileLayout>
      <BackBar
        title={dept ? dept.name : t('doctor.title')}
        subtitle={t('doctor.stepLabel')}
        href="/department"
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p style={{ fontSize: 13.5, color: colors.ink500, fontWeight: 600, margin: 0 }}>
          {t('doctor.subtitle')}
        </p>
        {doctors.map((doc) => (
          <DoctorCard key={doc.id} doctor={doc} onJoin={handleJoin} loading={loading} />
        ))}
      </div>

      <BottomNav />
    </MobileLayout>
  );
}

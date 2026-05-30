'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MobileLayout }     from '@/components/layout/MobileLayout';
import { BackBar }          from '@/components/layout/BackBar';
import { BottomNav }        from '@/components/layout/BottomNav';
import { DoctorCard }       from '@/components/patient/DoctorCard';
import { colors }           from '@/theme';
import { MOCK_DOCTORS }     from '@/lib/mockData';
import { usePatientStore }  from '@/store/patientStore';
import { useTranslation }   from '@/hooks/useTranslation';
import type { Doctor }      from '@/types/doctor';
import type { Department }  from '@/types/department';

export default function DoctorPage() {
  const router  = useRouter();
  const params  = useParams<{ deptId: string }>();
  const deptId  = params.deptId;

  const { t }             = useTranslation();
  const setDoctor         = usePatientStore((s) => s.setSelectedDoctor);
  const setActiveEntry    = usePatientStore((s) => s.setActiveEntry);
  const selectedPatient   = usePatientStore((s) => s.selectedPatient);
  const activeEntries     = usePatientStore((s) => s.activeEntries);
  const account           = usePatientStore((s) => s.account);

  const [loading, setLoading]             = useState(false);
  const [joinError, setJoinError]         = useState<string | null>(null);
  const [joinInfo, setJoinInfo]           = useState<string | null>(null);
  const [doctors, setDoctors]             = useState<Doctor[]>(MOCK_DOCTORS[deptId] ?? []);
  const [dept, setDept]                   = useState<Department | null>(null);
  const [fetchingDoctors, setFetchingDoctors] = useState(true);

  // Guard: need account + selected patient
  useEffect(() => {
    if (!account.id) { router.replace('/register'); return; }
    if (!selectedPatient) { router.replace('/family'); return; }
  }, [account.id, selectedPatient, router]);

  useEffect(() => {
    import('@/services/departmentService').then(({ getDepartments }) =>
      getDepartments().then((depts) => setDept(depts.find((d) => d.id === deptId) ?? null)),
    );

    setFetchingDoctors(true);
    import('@/services/doctorService')
      .then(({ getDoctorsByDepartment }) => getDoctorsByDepartment(deptId))
      .then(setDoctors)
      .catch(() => setDoctors(MOCK_DOCTORS[deptId] ?? []))
      .finally(() => setFetchingDoctors(false));
  }, [deptId]);

  const handleJoin = async (doc: Doctor) => {
    if (!selectedPatient) return;
    setJoinError(null);
    setJoinInfo(null);

    // Check local store first — one active token per patient
    const localEntry = activeEntries[selectedPatient.id];
    if (localEntry) {
      setJoinError(
        `${selectedPatient.name} already has Token ${localEntry.token_label}${localEntry._departmentName ? ` in ${localEntry._departmentName}` : ''}. Please wait for the current appointment to complete.`,
      );
      return;
    }

    setLoading(true);
    try {
      setDoctor(doc);

      const { joinQueue, getLiveQueueState, restoreQueueState } = await import('@/services/queueService');
      const { useQueueStore } = await import('@/store/queueStore');

      const deptName = dept?.name ?? deptId;

      const { entry, alreadyInQueue } = await joinQueue({
        patientId:      selectedPatient.id,
        doctorId:       doc.id,
        departmentId:   deptId,
        doctorName:     doc.name,
        departmentName: deptName,
        room:           doc.room,
      });

      // Enrich the entry with names for homepage display
      const enrichedEntry = { ...entry, _departmentName: deptName, _doctorName: doc.name };
      setActiveEntry(selectedPatient.id, enrichedEntry);

      if (alreadyInQueue) {
        // Entry exists in DB but wasn't in local store (e.g. different device)
        setJoinInfo(`${selectedPatient.name} already has an active token. Restoring your queue position…`);
        const live = await restoreQueueState(entry);
        useQueueStore.getState().setLive(live);
        router.push('/track');
        return;
      }

      const live = await getLiveQueueState(
        entry.queue_id,
        entry.token_number,
        doc.name,
        deptName,
        doc.room,
      );
      useQueueStore.getState().setLive(live);

      router.push('/confirm');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setJoinError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!account.id || !selectedPatient) return null;

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

        {joinInfo && (
          <p style={{ fontSize: 13, color: colors.primary, background: '#e8f0fe', borderRadius: 8, padding: '10px 12px', margin: 0, fontWeight: 600 }}>
            {joinInfo}
          </p>
        )}
        {joinError && (
          <p style={{ fontSize: 13, color: colors.danger, background: '#fff0f0', borderRadius: 8, padding: '10px 12px', margin: 0, fontWeight: 600 }}>
            {joinError}
          </p>
        )}

        {fetchingDoctors ? (
          <p style={{ color: colors.ink400, fontSize: 14, textAlign: 'center', marginTop: 32 }}>Loading…</p>
        ) : doctors.length === 0 ? (
          <p style={{ color: colors.ink400, fontSize: 14, textAlign: 'center', marginTop: 32 }}>No doctors found for this department.</p>
        ) : (
          doctors.map((doc) => (
            <DoctorCard key={doc.id} doctor={doc} onJoin={handleJoin} loading={loading} />
          ))
        )}
      </div>

      <BottomNav />
    </MobileLayout>
  );
}

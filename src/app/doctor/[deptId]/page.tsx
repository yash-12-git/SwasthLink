'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MobileLayout }     from '@/components/layout/MobileLayout';
import { BackBar }          from '@/components/layout/BackBar';
import { BottomNav }        from '@/components/layout/BottomNav';
import { DoctorCard }       from '@/components/patient/DoctorCard';
import { colors }           from '@/theme';
import { MOCK_DOCTORS }     from '@/lib/mockData';
import { usePatientStore }                               from '@/store/patientStore';
import { useQueueStore }                                 from '@/store/queueStore';
import { useTranslation }                                from '@/hooks/useTranslation';
import { joinQueueAndGetState, restoreQueueState }       from '@/services/queueService';
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
  const hospital          = usePatientStore((s) => s.hospital);

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
    setFetchingDoctors(true);
    const h = hospital.slug ? `&h=${hospital.slug}` : '';
    Promise.all([
      fetch(`/api/departments${hospital.slug ? `?h=${hospital.slug}` : ''}`).then((r) => r.json() as Promise<Department[]>),
      fetch(`/api/doctors?dept=${deptId}${h}`).then((r) => r.json() as Promise<Doctor[]>),
    ])
      .then(([depts, docs]) => {
        setDept(depts.find((d) => d.id === deptId) ?? null);
        setDoctors(docs);
      })
      .catch(() => setDoctors(MOCK_DOCTORS[deptId] ?? []))
      .finally(() => setFetchingDoctors(false));
  }, [deptId, hospital.slug]);

  const handleJoin = async (doc: Doctor) => {
    if (!selectedPatient) return;
    setJoinError(null);
    setJoinInfo(null);

    // Check local store first — one active token per patient
    const localEntry = (activeEntries[hospital.id ?? ''] ?? {})[selectedPatient.id];
    if (localEntry) {
      setJoinError(
        `${selectedPatient.name} already has Token ${localEntry.token_label}${localEntry._departmentName ? ` in ${localEntry._departmentName}` : ''}. Please wait for the current appointment to complete.`,
      );
      return;
    }

    setLoading(true);
    try {
      setDoctor(doc);

      const deptName = dept?.name ?? deptId;

      // Single server call: join queue + fetch live state together
      const { entry, alreadyInQueue, live } = await joinQueueAndGetState({
        patientId:      selectedPatient.id,
        doctorId:       doc.id,
        departmentId:   deptId,
        doctorName:     doc.name,
        departmentName: deptName,
        room:           doc.room,
        hospitalId:     hospital.id,
      });

      const enrichedEntry = { ...entry, _departmentName: deptName, _doctorName: doc.name };
      setActiveEntry(hospital.id ?? '', selectedPatient.id, enrichedEntry);

      if (alreadyInQueue) {
        setJoinInfo(`${selectedPatient.name} already has an active token. Restoring your queue position…`);
        // live from joinQueueAndGetState is already the restored state
        useQueueStore.getState().setLive(live);
        router.push('/track');
        return;
      }

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

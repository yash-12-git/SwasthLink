'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Plus, Clock, ArrowRight, Phone } from 'lucide-react';
import { MobileLayout }    from '@/components/layout/MobileLayout';
import { BackBar }         from '@/components/layout/BackBar';
import { BottomNav }       from '@/components/layout/BottomNav';
import { colors, radius }  from '@/theme';
import { usePatientStore } from '@/store/patientStore';
import type { Patient }    from '@/types/patient';

const GENDER_LABEL: Record<string, string> = { M: 'Male', F: 'Female', O: 'Other' };

export default function FamilyPage() {
  const router             = useRouter();
  const account            = usePatientStore((s) => s.account);
  const familyMembers      = usePatientStore((s) => s.familyMembers);
  const setFamilyMembers   = usePatientStore((s) => s.setFamilyMembers);
  const setSelectedPatient = usePatientStore((s) => s.setSelectedPatient);
  const activeEntries      = usePatientStore((s) => s.activeEntries);
  const clearAccount       = usePatientStore((s) => s.clearAccount);

  // Guard: must be logged in
  useEffect(() => {
    if (!account.id) router.replace('/register');
  }, [account.id, router]);

  // Refresh family list on mount (picks up members added from another session)
  useEffect(() => {
    if (!account.id) return;
    import('@/services/accountService')
      .then(({ getPatientsByAccount }) => getPatientsByAccount(account.id!))
      .then(setFamilyMembers)
      .catch(() => {});
  }, [account.id, setFamilyMembers]);

  if (!account.id) return null;

  const handleSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    router.push('/department');
  };

  return (
    <MobileLayout>
      <BackBar title="Who is visiting today?" subtitle="Step 2 of 3" href="/" />

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Account info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: colors.ink500, fontSize: 13, fontWeight: 600 }}>
          <Phone size={13} />
          {account.mobile}
        </div>

        {familyMembers.length === 0 && (
          <p style={{ fontSize: 14, color: colors.ink400, fontWeight: 600, textAlign: 'center', margin: '16px 0' }}>
            No patients yet. Add your first family member below.
          </p>
        )}

        {familyMembers.map((patient) => {
          const entry   = activeEntries[patient.id];
          const hasActive = Boolean(entry);

          return (
            <button
              key={patient.id}
              onClick={() => handleSelect(patient)}
              style={{
                width: '100%', textAlign: 'left',
                background: colors.surface,
                border: `1.5px solid ${hasActive ? colors.primary : colors.border}`,
                borderRadius: radius.md,
                padding: '14px 16px',
                display: 'flex', alignItems: 'center', gap: 14,
                cursor: 'pointer',
                boxShadow: hasActive
                  ? '0 2px 8px rgba(21,101,192,0.14)'
                  : '0 1px 2px rgba(16,32,46,.05)',
              }}
            >
              {/* Avatar */}
              <div style={{
                width: 46, height: 46, borderRadius: '50%', flexShrink: 0,
                background: hasActive ? colors.primary : colors.surface2,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <User size={22} color={hasActive ? '#fff' : colors.ink500} />
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: colors.ink }}>
                  {patient.name}
                </div>
                <div style={{ fontSize: 12.5, color: colors.ink500, fontWeight: 600 }}>
                  {GENDER_LABEL[patient.gender] ?? patient.gender} · {patient.age} yrs
                </div>
                {hasActive && (
                  <div style={{
                    marginTop: 5, display: 'inline-flex', alignItems: 'center', gap: 5,
                    background: '#e8f0fe', borderRadius: 20, padding: '3px 10px',
                    color: colors.primary, fontSize: 12, fontWeight: 700,
                  }}>
                    <Clock size={11} />
                    Token {entry.token_label}
                    {entry._departmentName ? ` · ${entry._departmentName}` : ''}
                  </div>
                )}
              </div>

              <ArrowRight size={18} color={colors.ink400} style={{ flexShrink: 0 }} />
            </button>
          );
        })}

        {/* Add new patient */}
        <Link href="/add-patient" style={{ textDecoration: 'none' }}>
          <div style={{
            background: colors.surface2,
            border: `1.5px dashed ${colors.borderStrong}`,
            borderRadius: radius.md,
            padding: '14px 16px',
            display: 'flex', alignItems: 'center', gap: 14,
            cursor: 'pointer',
          }}>
            <div style={{
              width: 46, height: 46, borderRadius: '50%',
              background: colors.surface, border: `1.5px dashed ${colors.borderStrong}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Plus size={22} color={colors.ink500} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: colors.ink700 }}>Add New Patient</div>
              <div style={{ fontSize: 12.5, color: colors.ink400, fontWeight: 600 }}>
                Add a family member to this account
              </div>
            </div>
          </div>
        </Link>

        {/* Switch account */}
        <div style={{ textAlign: 'center', marginTop: 4 }}>
          <button
            onClick={clearAccount}
            style={{ background: 'none', border: 'none', color: colors.ink400, fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}
          >
            Not your number? Switch account
          </button>
        </div>
      </div>

      <BottomNav />
    </MobileLayout>
  );
}

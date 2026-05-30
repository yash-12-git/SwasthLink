'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, AlertTriangle, Users } from 'lucide-react';
import { MobileLayout }  from '@/components/layout/MobileLayout';
import { BottomNav }     from '@/components/layout/BottomNav';
import { Pill }          from '@/components/ui/Pill';
import { Button }        from '@/components/ui/Button';
import { LiveTracker }   from '@/components/patient/LiveTracker';
import { colors, radius, shadows } from '@/theme';
import { usePatientStore }   from '@/store/patientStore';
import { useQueueStore }     from '@/store/queueStore';
import { useTranslation }    from '@/hooks/useTranslation';
import type { Patient }      from '@/types/patient';

export default function TrackPage() {
  const { t }              = useTranslation();
  const familyMembers      = usePatientStore((s) => s.familyMembers);
  const selectedPatient    = usePatientStore((s) => s.selectedPatient);
  const setSelectedPatient = usePatientStore((s) => s.setSelectedPatient);
  const activeEntries      = usePatientStore((s) => s.activeEntries);
  const clearActiveEntry   = usePatientStore((s) => s.clearActiveEntry);
  const live               = useQueueStore((s) => s.live);
  const setLive            = useQueueStore((s) => s.setLive);

  // Patients who currently have an active token
  const patientsWithActive = familyMembers.filter((p) => activeEntries[p.id]);

  // Auto-select: if no patient is selected but one (or more) have active entries,
  // pick the first one automatically so the user always sees something useful
  useEffect(() => {
    if (!selectedPatient && patientsWithActive.length > 0) {
      setSelectedPatient(patientsWithActive[0]);
    }
  }, [selectedPatient, patientsWithActive, setSelectedPatient]);

  const activeEntry = selectedPatient ? activeEntries[selectedPatient.id] : null;

  // When the selected patient changes, clear stale live state so restore runs fresh
  const prevPatientId = React.useRef<string | null>(null);
  useEffect(() => {
    if (selectedPatient && prevPatientId.current !== selectedPatient.id) {
      if (prevPatientId.current !== null) {
        // Patient switched — drop stale live state
        setLive(null);
      }
      prevPatientId.current = selectedPatient.id;
    }
  }, [selectedPatient, setLive]);

  // Auto-restore live state after refresh or patient switch
  useEffect(() => {
    if (activeEntry && !live) {
      import('@/services/queueService')
        .then(({ restoreQueueState }) => restoreQueueState(activeEntry))
        .then(setLive)
        .catch(() => {});
    }
  }, [activeEntry, live, setLive]);

  const deptName    = live?.departmentName ?? activeEntry?._departmentName ?? '…';
  const doctorName  = live?.doctorName     ?? activeEntry?._doctorName     ?? '…';

  // When the doctor has advanced past this patient's token, the visit is complete.
  const isDone = Boolean(live && live.currentToken > live.yourToken);

  const handleDone = () => {
    if (selectedPatient) clearActiveEntry(selectedPatient.id);
    setLive(null);
  };
  const isRestoring = Boolean(activeEntry && !live);

  const [showCancel, setShowCancel]   = useState(false);
  const [cancelling, setCancelling]   = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const handleSwitchPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowCancel(false);
    setCancelError(null);
    // live state is cleared by the prevPatientId effect above
  };

  const handleCancelConfirm = async () => {
    if (!selectedPatient || !activeEntry) return;
    setCancelling(true);
    setCancelError(null);
    try {
      const { cancelQueueEntry } = await import('@/services/queueService');
      await cancelQueueEntry(activeEntry.id);
      clearActiveEntry(selectedPatient.id);
      setLive(null);
      setShowCancel(false);
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : 'Failed to cancel. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <MobileLayout>
      {/* ── Top bar ───────────────────────────────────────────────── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: colors.surface, borderBottom: `1px solid ${colors.border}`,
        padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10,
        flexShrink: 0, boxShadow: shadows.sm,
      }}>
        <Link href="/" style={{
          width: 40, height: 40, borderRadius: radius.sm,
          background: colors.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center',
          textDecoration: 'none', flexShrink: 0,
        }}>
          <ArrowLeft size={22} color={colors.ink700} />
        </Link>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: colors.ink, lineHeight: 1.1 }}>
            {t('track.title')}
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: colors.ink500 }}>
            {deptName} · {doctorName}
          </div>
        </div>
        <Pill bg={colors.success50} color={colors.success}>
          <RefreshCw size={12} /> {t('track.liveLabel')}
        </Pill>
      </div>

      {/* ── Patient switcher (shown when ≥1 patients have active tokens) ── */}
      {patientsWithActive.length > 0 && (
        <div style={{
          background: colors.surface,
          borderBottom: `1px solid ${colors.border}`,
          padding: '10px 14px',
          display: 'flex', gap: 8, alignItems: 'center',
          flexShrink: 0, overflowX: 'auto',
        }}>
          <Users size={14} color={colors.ink500} style={{ flexShrink: 0 }} />
          {patientsWithActive.map((patient) => {
            const isSelected = selectedPatient?.id === patient.id;
            const entry = activeEntries[patient.id];
            return (
              <button
                key={patient.id}
                onClick={() => handleSwitchPatient(patient)}
                style={{
                  flexShrink: 0,
                  padding: '6px 14px',
                  borderRadius: 20,
                  border: `1.5px solid ${isSelected ? colors.primary : colors.border}`,
                  background: isSelected ? colors.primary : colors.surface,
                  color: isSelected ? '#fff' : colors.ink700,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                  transition: 'all 0.15s',
                }}
              >
                {patient.name.split(' ')[0]}
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  background: isSelected ? 'rgba(255,255,255,0.25)' : colors.surface2,
                  color: isSelected ? '#fff' : colors.ink500,
                  borderRadius: 10, padding: '1px 6px',
                }}>
                  {entry.token_label}
                </span>
              </button>
            );
          })}
          {/* Link to family page to add/change patient without active token */}
          <Link href="/family" style={{ textDecoration: 'none', flexShrink: 0, marginLeft: 'auto' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: colors.primary }}>
              Switch →
            </span>
          </Link>
        </div>
      )}

      {/* ── Content ───────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {isRestoring ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48, gap: 12 }}>
            <RefreshCw size={28} color={colors.primary} />
            <p style={{ color: colors.ink500, fontWeight: 600, fontSize: 14, textAlign: 'center', margin: 0 }}>
              Loading your queue…
            </p>
          </div>
        ) : live ? (
          <>
            <LiveTracker />

            {/* Done state — visit complete */}
            {isDone ? (
              <div style={{ padding: '0 16px 24px' }}>
                <button
                  onClick={handleDone}
                  style={{
                    width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                    background: colors.success, color: '#fff',
                    fontWeight: 800, fontSize: 15, cursor: 'pointer',
                  }}
                >
                  Done — leave queue
                </button>
              </div>
            ) : (

            /* Cancel token */
            <div style={{ padding: '0 16px 24px' }}>
              {!showCancel ? (
                <div style={{ textAlign: 'center' }}>
                  <button
                    onClick={() => setShowCancel(true)}
                    style={{ background: 'none', border: 'none', color: colors.ink400, fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Need to leave? Cancel token
                  </button>
                </div>
              ) : (
                <div style={{
                  background: '#fff8f0', border: `1.5px solid ${colors.warning}`,
                  borderRadius: 12, padding: 16,
                  display: 'flex', flexDirection: 'column', gap: 10,
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <AlertTriangle size={20} color={colors.warning} style={{ flexShrink: 0, marginTop: 1 }} />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: colors.ink, marginBottom: 2 }}>
                        Cancel {selectedPatient?.name.split(' ')[0]}&apos;s token?
                      </div>
                      <div style={{ fontSize: 13, color: colors.ink500, fontWeight: 600, lineHeight: 1.4 }}>
                        They will lose their place in the queue and need a new token to return.
                      </div>
                    </div>
                  </div>
                  {cancelError && (
                    <div style={{ fontSize: 12.5, color: colors.danger, fontWeight: 600, background: '#fff0f0', borderRadius: 6, padding: '8px 10px' }}>
                      {cancelError}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      onClick={() => { setShowCancel(false); setCancelError(null); }}
                      style={{
                        flex: 1, padding: 10, borderRadius: 8, border: `1.5px solid ${colors.border}`,
                        background: colors.surface, fontWeight: 700, fontSize: 14, cursor: 'pointer', color: colors.ink,
                      }}
                    >
                      Keep token
                    </button>
                    <button
                      onClick={handleCancelConfirm}
                      disabled={cancelling}
                      style={{
                        flex: 1, padding: 10, borderRadius: 8, border: 'none',
                        background: colors.warning, fontWeight: 700, fontSize: 14, cursor: 'pointer', color: '#fff',
                        opacity: cancelling ? 0.7 : 1,
                      }}
                    >
                      {cancelling ? 'Cancelling…' : 'Yes, cancel'}
                    </button>
                  </div>
                </div>
              )}
            </div>
            )}
          </>
        ) : (
          /* No active entry for selected patient */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 }}>
            <p style={{ textAlign: 'center', color: colors.ink500, fontWeight: 600 }}>
              {selectedPatient
                ? `${selectedPatient.name.split(' ')[0]} has no active token.`
                : 'No active queue to track.'}
            </p>
            <Link href="/family" style={{ textDecoration: 'none' }}>
              <Button variant="primary">Get a Token</Button>
            </Link>
          </div>
        )}
      </div>

      <BottomNav />
    </MobileLayout>
  );
}

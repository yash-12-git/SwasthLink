'use client';

import React from 'react';
import Link from 'next/link';
import { Check, Info, ArrowRight, RefreshCw, Building2 } from 'lucide-react';
import { MobileLayout }  from '@/components/layout/MobileLayout';
import { BottomNav }     from '@/components/layout/BottomNav';
import { Card }          from '@/components/ui/Card';
import { Button }        from '@/components/ui/Button';
import { StatusBadge }   from '@/components/ui/StatusBadge';
import { TokenDisplay }  from '@/components/ui/TokenDisplay';
import { Avatar }        from '@/components/ui/Avatar';
import { Alert }         from '@/components/ui/Alert';
import { colors, radius } from '@/theme';
import { usePatientStore }  from '@/store/patientStore';
import { useQueueStore }    from '@/store/queueStore';
import { useTranslation }   from '@/hooks/useTranslation';

export default function ConfirmPage() {
  
  const { t }         = useTranslation();
  const activeEntry   = usePatientStore((s) => s.activeEntry);
  const patient       = usePatientStore((s) => s.patient);
  const selectedDoctor= usePatientStore((s) => s.selectedDoctor);
  const selectedDept  = usePatientStore((s) => s.selectedDept);
  const ahead         = useQueueStore((s) => s.patientsAhead());
  const wait          = useQueueStore((s) => s.estimatedWait());

  // Redirect if no entry
  if (!activeEntry) {
    return (
      <MobileLayout>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 }}>
          <p style={{ textAlign: 'center', color: colors.ink500, fontWeight: 600 }}>No active token. Please get a new one.</p>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Button variant="primary">Go to Home</Button>
          </Link>
        </div>
        <BottomNav />
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div style={{ flex: 1, overflowY: 'auto', background: colors.bg }}>

        {/* ── Success hero ────────────────────────────────────────── */}
        <div style={{ background: `linear-gradient(160deg, ${colors.success} 0%, #1B5E20 100%)`, padding: '26px 20px 64px', textAlign: 'center', color: '#fff' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px',
            animation: 'ht-ring 2s ease-out infinite',
          }}>
            <Check size={34} color="#fff" strokeWidth={3} />
          </div>
          <div style={{ fontSize: 21, fontWeight: 800 }}>{t('confirm.title')}</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,.82)', marginTop: 2 }}>
            आप कतार में जुड़ गए हैं
          </div>
        </div>

        {/* ── Token card (overlaps hero) ──────────────────────────── */}
        <div style={{ padding: '0 16px', marginTop: -48 }}>
          <Card pad="20px" style={{ boxShadow: '0 4px 12px rgba(16,32,46,.08), 0 16px 40px rgba(16,32,46,.08)', textAlign: 'center' }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: colors.ink500, textTransform: 'uppercase', letterSpacing: '.08em' }}>
              {t('confirm.yourToken')} · आपका टोकन
            </div>
            <div style={{ fontSize: 64, fontWeight: 800, color: colors.primary, lineHeight: 1.05, margin: '4px 0 2px', fontVariantNumeric: 'tabular-nums' }}>
              {activeEntry.token_label}
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: colors.ink500 }}>
              {patient.name ?? 'Patient'} · Age {patient.age ?? '—'}
            </div>

            {/* Mini stats */}
            <div style={{ display: 'flex', gap: 12, margin: '18px 0' }}>
              <TokenDisplay label={t('confirm.position')} value={`#${Math.max(1, ahead)}`} tone="ink" size="sm" sub={t('confirm.positionSub')} />
              <TokenDisplay label={t('confirm.estWait')} value={`${wait}m`} tone="primary" size="sm" sub={t('confirm.estWaitSub')} />
            </div>

            {/* Doctor info */}
            <div style={{ background: colors.surface2, borderRadius: radius.sm, padding: '12px 14px', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <Avatar name={selectedDoctor?.name ?? 'Dr. A. Sharma'} size={42} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 800, color: colors.ink }}>{selectedDoctor?.name ?? 'Dr. A. Sharma'}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: colors.ink500 }}>
                    {selectedDept?.name ?? 'General OPD'} · {selectedDoctor?.room ?? 'Room 4'}
                  </div>
                </div>
                <StatusBadge status="available" pulse sm />
              </div>
            </div>
          </Card>
        </div>

        {/* ── Actions ─────────────────────────────────────────────── */}
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Alert variant="info" icon={<Info size={22} />}>
            {t('confirm.relaxInfo')}
          </Alert>

          <Link href="/track" style={{ textDecoration: 'none' }}>
            <Button full size="lg" variant="success">
              <RefreshCw size={20} /> {t('confirm.trackLive')} <ArrowRight size={20} />
            </Button>
          </Link>

          <Link href="/" style={{ textDecoration: 'none' }}>
            <Button full size="md" variant="ghost">
              <Building2 size={17} /> {t('confirm.backHome')}
            </Button>
          </Link>
        </div>
      </div>

      <BottomNav />
    </MobileLayout>
  );
}

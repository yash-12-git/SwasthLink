'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { MobileLayout }  from '@/components/layout/MobileLayout';
import { BottomNav }     from '@/components/layout/BottomNav';
import { Pill }          from '@/components/ui/Pill';
import { Button }        from '@/components/ui/Button';
import { LiveTracker }   from '@/components/patient/LiveTracker';
import { colors, radius, shadows } from '@/theme';
import { usePatientStore }   from '@/store/patientStore';
import { useQueueStore }     from '@/store/queueStore';
import { useTranslation }    from '@/hooks/useTranslation';

export default function TrackPage() {
  const { t }         = useTranslation();
  
  const selectedDept  = usePatientStore((s) => s.selectedDept);
  const selectedDoctor= usePatientStore((s) => s.selectedDoctor);
  const live          = useQueueStore((s) => s.live);

  return (
    <MobileLayout>
      {/* Sticky top bar */}
      <div style={{
        position:     'sticky',
        top:           0,
        zIndex:        10,
        background:    colors.surface,
        borderBottom: `1px solid ${colors.border}`,
        padding:       '12px 14px',
        display:       'flex',
        alignItems:    'center',
        gap:           10,
        flexShrink:    0,
        boxShadow:     shadows.sm,
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
            {selectedDept?.name ?? 'General OPD'} · {selectedDoctor?.name ?? 'Dr. A. Sharma'}
          </div>
        </div>
        <Pill bg={colors.success50} color={colors.success}>
          <RefreshCw size={12} /> {t('track.liveLabel')}
        </Pill>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {live ? (
          <LiveTracker />
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 }}>
            <p style={{ textAlign: 'center', color: colors.ink500, fontWeight: 600 }}>
              No active queue to track. Please get a token first.
            </p>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <Button variant="primary">Get a Token</Button>
            </Link>
          </div>
        )}
      </div>

      <BottomNav />
    </MobileLayout>
  );
}

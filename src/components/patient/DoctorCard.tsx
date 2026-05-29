'use client';

import React from 'react';
import { ArrowRight, Ticket } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { colors, radius } from '@/theme';
import { useTranslation } from '@/hooks/useTranslation';
import type { Doctor } from '@/types/doctor';

interface DoctorCardProps {
  doctor:  Doctor;
  onJoin:  (doc: Doctor) => void;
  loading: boolean;
}

export function DoctorCard({ doctor, onJoin, loading }: DoctorCardProps) {
  const { t } = useTranslation();
  const paused = doctor.status === 'paused';

  const StatBox = ({ value, label, color = colors.ink }: { value: string; label: string; color?: string }) => (
    <div style={{ flex: 1, background: colors.surface2, borderRadius: radius.sm, padding: '10px 12px' }}>
      <div style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      <div style={{ fontSize: 11.5, fontWeight: 600, color: colors.ink500, marginTop: 3 }}>{label}</div>
    </div>
  );

  return (
    <Card pad="16px" style={{ opacity: paused ? 0.85 : 1 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <Avatar name={doctor.name} size={50} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16.5, fontWeight: 800, color: colors.ink, lineHeight: 1.1 }}>{doctor.name}</div>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: colors.ink500 }}>{doctor.specialty} · {doctor.room}</div>
        </div>
        <StatusBadge status={doctor.status} pulse={doctor.status === 'available'} sm />
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
        <StatBox value={String(doctor.queue_count)} label={t('doctor.inQueue')} />
        <StatBox
          value={doctor.avg_wait_mins != null ? `~${doctor.avg_wait_mins}m` : t('doctor.noWait')}
          label={t('doctor.estWait')}
          color={paused ? colors.ink400 : colors.warning}
        />
      </div>

      {/* CTA */}
      <Button
        full
        size="md"
        variant={paused ? 'ghost' : 'primary'}
        disabled={paused || loading}
        onClick={() => !paused && onJoin(doctor)}
      >
        {paused ? (
          t('doctor.queuePaused')
        ) : (
          <>
            <Ticket size={18} />
            {t('doctor.joinQueue')}
            <ArrowRight size={18} />
          </>
        )}
      </Button>
    </Card>
  );
}

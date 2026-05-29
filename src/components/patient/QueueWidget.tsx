'use client';

import React from 'react';
import { RefreshCw, ChevronRight, Ticket } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { TokenDisplay } from '@/components/ui/TokenDisplay';
import { Pill } from '@/components/ui/Pill';
import { colors, radius } from '@/theme';
import { useQueueStore } from '@/store/queueStore';
import { useTranslation } from '@/hooks/useTranslation';

interface QueueWidgetProps {
  variant?: 'card' | 'banner';
  onClick?: () => void;
}

export function QueueWidget({ variant = 'card', onClick }: QueueWidgetProps) {
  const live = useQueueStore((s) => s.live);
  const ahead = useQueueStore((s) => s.patientsAhead());
  const wait  = useQueueStore((s) => s.estimatedWait());
  const { t } = useTranslation();

  if (!live) return null;

  if (variant === 'banner') {
    return (
      <div
        onClick={onClick}
        style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
          background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`,
          borderRadius: radius.md, color: '#fff', cursor: onClick ? 'pointer' : 'default',
          boxShadow: '0 4px 12px rgba(21,101,192,0.28)',
        }}
      >
        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Ticket size={24} color="#fff" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.75)' }}>
            {t('widget.yourToken')} · {live.yourTokenLabel}
          </div>
          <div style={{ fontSize: 15, fontWeight: 800 }}>
            {t('widget.ahead', { n: ahead, mins: wait })}
          </div>
        </div>
        <div style={{ textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.7)' }}>NOW</div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>{live.currentTokenLabel}</div>
        </div>
        <ChevronRight size={20} color="rgba(255,255,255,.8)" />
      </div>
    );
  }

  return (
    <Card pad="16px" style={{ cursor: onClick ? 'pointer' : 'default' }} onClick={onClick}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <Pill bg={colors.success50} color={colors.success}>
          <RefreshCw size={12} /> {t('widget.liveTracking')}
        </Pill>
        <span style={{ fontSize: 12, fontWeight: 700, color: colors.ink500 }}>{live.departmentName}</span>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <TokenDisplay label={t('widget.nowServing')} value={live.currentTokenLabel} tone="ink" size="sm" pulse />
        <TokenDisplay label={t('widget.yourToken')}  value={live.yourTokenLabel}    tone="primary" size="sm" />
      </div>
      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: colors.warning50, borderRadius: radius.sm, padding: '10px 14px' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: colors.warning }}>{t('widget.estWait')}</span>
        <span style={{ fontSize: 18, fontWeight: 800, color: colors.warning, fontVariantNumeric: 'tabular-nums' }}>
          ~{wait} min · {ahead} ahead
        </span>
      </div>
    </Card>
  );
}

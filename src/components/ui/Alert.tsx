'use client';

import React from 'react';
import { colors, radius, shadows } from '@/theme';

type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

const ALERT_STYLES: Record<AlertVariant, { bg: string; border: string; color: string }> = {
  info:    { bg: colors.primary50, border: colors.primary100, color: colors.primaryDark },
  success: { bg: colors.success50, border: colors.successBd,  color: colors.success     },
  warning: { bg: colors.warning50, border: colors.warningBd,  color: colors.warning     },
  danger:  { bg: colors.danger50,  border: colors.dangerBd,   color: colors.danger      },
};

interface AlertProps {
  variant?: AlertVariant;
  icon?:    React.ReactNode;
  children: React.ReactNode;
}

export function Alert({ variant = 'info', icon, children }: AlertProps) {
  const s = ALERT_STYLES[variant];
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 11,
        background: s.bg, border: `1px solid ${s.border}`,
        borderRadius: radius.sm, padding: '13px 15px', color: s.color,
      }}
    >
      {icon && <span style={{ flexShrink: 0, display: 'flex', color: s.color }}>{icon}</span>}
      <div style={{ fontSize: '13px', fontWeight: 700, lineHeight: 1.4 }}>{children}</div>
    </div>
  );
}

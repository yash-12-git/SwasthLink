'use client';

import React from 'react';
import { colors, radius } from '@/theme';

type Tone = 'primary' | 'success' | 'ink' | 'white';
type Size = 'sm' | 'md' | 'lg' | 'xl';

const TONES: Record<Tone, { c: string; bg: string; bd: string }> = {
  primary: { c: colors.primary,  bg: colors.primary50, bd: colors.primary100 },
  success: { c: colors.success,  bg: colors.success50, bd: colors.successBd  },
  ink:     { c: colors.ink,      bg: colors.surface2,  bd: colors.border     },
  white:   { c: '#fff',          bg: 'rgba(255,255,255,.12)', bd: 'rgba(255,255,255,.18)' },
};
const FONT_SIZES: Record<Size, number> = { sm: 30, md: 46, lg: 76, xl: 120 };

interface TokenDisplayProps {
  label?: string;
  value:  string;
  tone?:  Tone;
  size?:  Size;
  sub?:   string;
  pulse?: boolean;
  style?: React.CSSProperties;
}

export function TokenDisplay({ label, value, tone = 'ink', size = 'md', sub, pulse, style }: TokenDisplayProps) {
  const t  = TONES[tone];
  const fs = FONT_SIZES[size];
  return (
    <div
      style={{
        background: t.bg, border: `1.5px solid ${t.bd}`, borderRadius: radius.md,
        padding: size === 'sm' ? '12px 14px' : '20px',
        textAlign: 'center', flex: 1, ...style,
      }}
    >
      {label && (
        <div style={{ fontSize: 12, fontWeight: 700, color: tone === 'white' ? 'rgba(255,255,255,.7)' : colors.ink500, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>
          {label}
        </div>
      )}
      <div style={{ fontSize: fs, fontWeight: 800, color: t.c, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontVariantNumeric: 'tabular-nums' }}>
        {pulse && (
          <span style={{ width: fs * 0.18, height: fs * 0.18, borderRadius: '50%', background: t.c, animation: 'ht-pulse 1.5s ease-in-out infinite', flexShrink: 0 }} />
        )}
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 12.5, fontWeight: 600, marginTop: 6, color: tone === 'white' ? 'rgba(255,255,255,.7)' : colors.ink500 }}>
          {sub}
        </div>
      )}
    </div>
  );
}

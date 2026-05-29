'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Pill } from '@/components/ui/Pill';
import { colors, radius } from '@/theme';

interface BackBarProps {
  title:     string;
  subtitle?: string;
  step?:     string;
  href:      string;
}

export function BackBar({ title, subtitle, step, href }: BackBarProps) {
  return (
    <div
      style={{
        position:     'sticky',
        top:          0,
        zIndex:       10,
        background:   colors.surface,
        borderBottom: `1px solid ${colors.border}`,
        padding:      '12px 14px',
        display:      'flex',
        alignItems:   'center',
        gap:          10,
        flexShrink:   0,
      }}
    >
      <Link
        href={href}
        style={{
          width:          40,
          height:         40,
          borderRadius:   radius.sm,
          background:     colors.surface2,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          flexShrink:     0,
          textDecoration: 'none',
        }}
      >
        <ArrowLeft size={22} color={colors.ink700} />
      </Link>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 16.5, fontWeight: 800, color: colors.ink, lineHeight: 1.1 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, fontWeight: 600, color: colors.ink500 }}>{subtitle}</div>}
      </div>
      {step && (
        <Pill bg={colors.primary50} color={colors.primary}>{step}</Pill>
      )}
    </div>
  );
}

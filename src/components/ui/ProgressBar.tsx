'use client';

import React from 'react';
import { colors } from '@/theme';

interface ProgressBarProps {
  value: number;       // 0–100
  color?: string;
  height?: number;
  track?: string;
}

export function ProgressBar({
  value,
  color  = colors.primary,
  height = 10,
  track  = colors.surface2,
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div style={{ background: track, height, borderRadius: 99, overflow: 'hidden' }}>
      <div
        style={{
          width:        `${pct}%`,
          height:       '100%',
          background:   color,
          borderRadius: 99,
          transition:   'width 0.7s cubic-bezier(0.4,0,0.2,1)',
        }}
      />
    </div>
  );
}

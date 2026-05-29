'use client';

import React from 'react';
import { colors } from '@/theme';

interface AvatarProps {
  name:   string;
  size?:  number;
  color?: string;
  bg?:    string;
}

export function Avatar({ name, size = 44, color = colors.primary, bg = colors.primary50 }: AvatarProps) {
  const initials = name
    .replace(/^Dr\.?\s*/i, '')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div
      style={{
        width: size, height: size, borderRadius: '50%',
        background: bg, color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 800, fontSize: size * 0.36, flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

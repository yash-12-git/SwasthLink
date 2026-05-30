'use client';

import type { HTMLAttributes, CSSProperties } from 'react';
import { colors, radius } from '@/theme';

interface PillProps extends HTMLAttributes<HTMLSpanElement> {
  color?: string;
  bg?:    string;
  style?: CSSProperties;
}

export function Pill({ color = colors.ink700, bg = colors.surface2, style, children, ...rest }: PillProps) {
  return (
    <span
      style={{
        display:      'inline-flex',
        alignItems:   'center',
        gap:          6,
        padding:      '6px 11px',
        borderRadius: radius.pill,
        background:   bg,
        color,
        fontSize:     12.5,
        fontWeight:   600,
        whiteSpace:   'nowrap',
        lineHeight:   1,
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  );
}

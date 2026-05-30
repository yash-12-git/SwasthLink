'use client';

import type { HTMLAttributes, CSSProperties } from 'react';
import { colors, radius, shadows } from '@/theme';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  pad?:    string;
  hover?:  boolean;
  accent?: string;
  style?:  CSSProperties;
}

export function Card({ pad = '20px', hover, accent, style, children, ...rest }: CardProps) {
  return (
    <div
      style={{
        background:    colors.surface,
        borderRadius:  radius.md,
        border:        `1px solid ${colors.border}`,
        padding:       pad,
        boxShadow:     shadows.sm,
        borderLeft:    accent ? `4px solid ${accent}` : undefined,
        cursor:        hover ? 'pointer' : 'default',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

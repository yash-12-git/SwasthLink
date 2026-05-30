'use client';

import React from 'react';
import { colors } from '@/theme';

interface MobileLayoutProps {
  children: React.ReactNode;
}

/**
 * Full-height mobile shell. Pages fill this with sticky header + scrollable
 * content + optional sticky footer — each page manages its own inner layout.
 */
export function MobileLayout({ children }: MobileLayoutProps) {
  return (
    <div
      style={{
        height:        '100dvh',
        overflow:      'hidden',
        background:    colors.bg,
        display:       'flex',
        flexDirection: 'column',
        fontFamily:    '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif',
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      {children}
    </div>
  );
}

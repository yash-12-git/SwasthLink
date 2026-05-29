'use client';

import React from 'react';
import { colors } from '@/theme';

interface SectionLabelProps {
  children: React.ReactNode;
  action?:  React.ReactNode;
}

export function SectionLabel({ children, action }: SectionLabelProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
      <div style={{ fontSize: '13px', fontWeight: 700, color: colors.ink500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {children}
      </div>
      {action}
    </div>
  );
}

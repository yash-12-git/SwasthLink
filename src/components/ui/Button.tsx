'use client';

import type { ButtonHTMLAttributes, CSSProperties } from 'react';
import { colors, radius, touchTarget } from '@/theme';

type Variant = 'primary' | 'success' | 'danger' | 'warning' | 'secondary' | 'ghost';
type Size    = 'sm' | 'md' | 'lg';

const variantMap: Record<Variant, { bg: string; fg: string; border: string }> = {
  primary:   { bg: colors.primary,  fg: '#fff',         border: 'transparent'      },
  success:   { bg: colors.success,  fg: '#fff',         border: 'transparent'      },
  danger:    { bg: colors.danger,   fg: '#fff',         border: 'transparent'      },
  warning:   { bg: colors.warning,  fg: '#fff',         border: 'transparent'      },
  secondary: { bg: colors.surface,  fg: colors.primary, border: colors.primary100  },
  ghost:     { bg: 'transparent',   fg: colors.ink700,  border: colors.border      },
};

const sizeMap: Record<Size, { h: string; fs: string; px: string }> = {
  sm: { h: '38px', fs: '14px',   px: '14px' },
  md: { h: '48px', fs: '15.5px', px: '20px' },
  lg: { h: '56px', fs: '17px',   px: '24px' },
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?:    Size;
  full?:    boolean;
  style?:   CSSProperties;
}

export function Button({
  variant = 'primary',
  size    = 'md',
  full,
  disabled,
  style,
  children,
  ...rest
}: ButtonProps) {
  const v = variantMap[variant];
  const s = sizeMap[size];
  return (
    <button
      disabled={disabled}
      style={{
        display:         'inline-flex',
        alignItems:      'center',
        justifyContent:  'center',
        gap:             8,
        fontFamily:      'inherit',
        fontWeight:      700,
        letterSpacing:   '0.01em',
        whiteSpace:      'nowrap',
        cursor:          disabled ? 'not-allowed' : 'pointer',
        borderRadius:    radius.sm,
        height:          s.h,
        fontSize:        s.fs,
        padding:         `0 ${s.px}`,
        width:           full ? '100%' : 'auto',
        minHeight:       touchTarget,
        background:      disabled ? colors.surface2 : v.bg,
        color:           disabled ? colors.ink400   : v.fg,
        border:          `1.5px solid ${disabled ? colors.border : v.border}`,
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}

'use client';

import styled from '@emotion/styled';
import { colors, radius, touchTarget } from '@/theme';

type Variant = 'primary' | 'success' | 'danger' | 'warning' | 'secondary' | 'ghost';
type Size    = 'sm' | 'md' | 'lg';

const variantMap: Record<Variant, { bg: string; fg: string; border: string; hoverBg: string }> = {
  primary:   { bg: colors.primary,   fg: '#fff', border: 'transparent', hoverBg: colors.primaryDark },
  success:   { bg: colors.success,   fg: '#fff', border: 'transparent', hoverBg: '#1B5E20' },
  danger:    { bg: colors.danger,    fg: '#fff', border: 'transparent', hoverBg: '#B71C1C' },
  warning:   { bg: colors.warning,   fg: '#fff', border: 'transparent', hoverBg: '#C75B00' },
  secondary: { bg: colors.surface,   fg: colors.primary, border: colors.primary100, hoverBg: colors.primary50 },
  ghost:     { bg: 'transparent',    fg: colors.ink700,  border: colors.border,     hoverBg: colors.surface2 },
};

const sizeMap: Record<Size, { h: string; fs: string; px: string }> = {
  sm: { h: '38px', fs: '14px',   px: '14px' },
  md: { h: '48px', fs: '15.5px', px: '20px' },
  lg: { h: '56px', fs: '17px',   px: '24px' },
};

interface ButtonProps {
  variant?: Variant;
  size?:    Size;
  full?:    boolean;
  disabled?: boolean;
}

export const Button = styled.button<ButtonProps>`
  display:         inline-flex;
  align-items:     center;
  justify-content: center;
  gap:             8px;
  font-family:     inherit;
  font-weight:     700;
  letter-spacing:  0.01em;
  white-space:     nowrap;
  cursor:          pointer;
  border-radius:   ${radius.sm};
  transition:      background 0.16s ease, box-shadow 0.16s ease, transform 0.1s ease;
  min-height:      ${touchTarget};

  height:     ${({ size = 'md' }) => sizeMap[size].h};
  font-size:  ${({ size = 'md' }) => sizeMap[size].fs};
  padding:    0 ${({ size = 'md' }) => sizeMap[size].px};
  width:      ${({ full }) => (full ? '100%' : 'auto')};

  background: ${({ variant = 'primary', disabled }) =>
    disabled ? colors.surface2 : variantMap[variant].bg};
  color:  ${({ variant = 'primary', disabled }) =>
    disabled ? colors.ink400 : variantMap[variant].fg};
  border: 1.5px solid ${({ variant = 'primary', disabled }) =>
    disabled ? colors.border : variantMap[variant].border};

  &:hover:not(:disabled) {
    background: ${({ variant = 'primary' }) => variantMap[variant].hoverBg};
    box-shadow: ${({ variant = 'primary' }) =>
      variant === 'ghost' || variant === 'secondary'
        ? 'none'
        : '0 6px 16px rgba(0,0,0,0.18)'};
  }
  &:active:not(:disabled) { transform: scale(0.98); }
  &:disabled { cursor: not-allowed; }
`;

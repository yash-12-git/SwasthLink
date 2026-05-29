'use client';

import React from 'react';
import styled, { CSSObject } from '@emotion/styled';
import { colors, radius } from '@/theme';
import { useTranslation } from '@/hooks/useTranslation';

type StatusKey = 'available' | 'busy' | 'paused' | 'serving' | 'waiting' | 'done' | 'skipped';

const STATUS_STYLES: Record<StatusKey, { color: string; bg: string }> = {
  available: { color: colors.success,  bg: colors.success50 },
  busy:      { color: colors.warning,  bg: colors.warning50 },
  paused:    { color: colors.danger,   bg: colors.danger50  },
  serving:   { color: colors.success,  bg: colors.success50 },
  waiting:   { color: colors.ink500,   bg: colors.surface2  },
  done:      { color: colors.ink400,   bg: colors.surface2  },
  skipped:   { color: colors.warning,  bg: colors.warning50 },
};

interface DotProps { statusColor: string; pulse?: boolean }
const Dot = styled.span<DotProps>`
  width:         8px;
  height:        8px;
  border-radius: 50%;
  flex-shrink:   0;
  background:    ${({ statusColor }) => statusColor};
  ${({ pulse }) =>
    pulse
      ? `animation: ht-pulse 1.6s ease-in-out infinite;`
      : ''}
`;

interface BadgeWrapProps { color: string; bg: string; sm?: boolean }
const BadgeWrap = styled.span<BadgeWrapProps>`
  display:       inline-flex;
  align-items:   center;
  gap:           ${({ sm }) => (sm ? '5px' : '7px')};
  padding:       ${({ sm }) => (sm ? '4px 9px' : '6px 12px')};
  border-radius: ${radius.pill};
  background:    ${({ bg }) => bg};
  color:         ${({ color }) => color};
  font-size:     ${({ sm }) => (sm ? '11.5px' : '13px')};
  font-weight:   700;
  white-space:   nowrap;
  line-height:   1;
`;

interface Props {
  status: StatusKey;
  label?: string;
  pulse?: boolean;
  sm?: boolean;
}

export function StatusBadge({ status, label, pulse, sm }: Props) {
  const { t } = useTranslation();
  const s = STATUS_STYLES[status];
  return (
    <BadgeWrap color={s.color} bg={s.bg} sm={sm}>
      <Dot statusColor={s.color} pulse={pulse} />
      {label ?? t(`status.${status}`)}
    </BadgeWrap>
  );
}

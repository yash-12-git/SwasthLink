'use client';

import { colors, radius } from '@/theme';
import { useTranslation } from '@/hooks/useTranslation';

type StatusKey = 'available' | 'busy' | 'paused' | 'serving' | 'waiting' | 'done' | 'skipped';

const STATUS_STYLES: Record<StatusKey, { color: string; bg: string }> = {
  available: { color: colors.success, bg: colors.success50 },
  busy:      { color: colors.warning, bg: colors.warning50 },
  paused:    { color: colors.danger,  bg: colors.danger50  },
  serving:   { color: colors.success, bg: colors.success50 },
  waiting:   { color: colors.ink500,  bg: colors.surface2  },
  done:      { color: colors.ink400,  bg: colors.surface2  },
  skipped:   { color: colors.warning, bg: colors.warning50 },
};

interface Props {
  status: StatusKey;
  label?: string;
  pulse?: boolean;
  sm?:    boolean;
}

export function StatusBadge({ status, label, pulse, sm }: Props) {
  const { t } = useTranslation();
  const s = STATUS_STYLES[status];
  return (
    <span
      style={{
        display:      'inline-flex',
        alignItems:   'center',
        gap:          sm ? 5 : 7,
        padding:      sm ? '4px 9px' : '6px 12px',
        borderRadius: radius.pill,
        background:   s.bg,
        color:        s.color,
        fontSize:     sm ? 11.5 : 13,
        fontWeight:   700,
        whiteSpace:   'nowrap',
        lineHeight:   1,
      }}
    >
      <span
        style={{
          width:        8,
          height:       8,
          borderRadius: '50%',
          flexShrink:   0,
          background:   s.color,
          animation:    pulse ? 'ht-pulse 1.6s ease-in-out infinite' : undefined,
        }}
      />
      {label ?? t(`status.${status}`)}
    </span>
  );
}

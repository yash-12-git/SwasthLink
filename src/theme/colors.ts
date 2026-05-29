export const colors = {
  // ── Brand ──────────────────────────────────────────────────────────
  primary:     '#1565C0',
  primaryDark: '#0D47A1',
  primary700:  '#1565C0cc',
  primary100:  '#BBDEFB',
  primary50:   '#E3F2FD',

  // ── Semantic ────────────────────────────────────────────────────────
  success:   '#2E7D32',
  success50: '#E8F5E9',
  successBd: '#A5D6A7',

  warning:   '#ED6C02',
  warning50: '#FFF3E0',
  warningBd: '#FFCC80',

  danger:    '#D32F2F',
  danger50:  '#FFEBEE',
  dangerBd:  '#EF9A9A',

  // ── Neutrals ────────────────────────────────────────────────────────
  bg:          '#F7F9FC',
  surface:     '#FFFFFF',
  surface2:    '#F1F5FA',
  border:      '#E3E9F2',
  borderStrong:'#CFD8E5',

  ink:    '#16202E',
  ink700: '#34465B',
  ink500: '#5E7186',
  ink400: '#8A9AAC',

  // ── Overlay ─────────────────────────────────────────────────────────
  overlay: 'rgba(22, 32, 46, 0.48)',
} as const;

export type ColorToken = keyof typeof colors;

export { colors } from './colors';
export { spacing, radius, touchTarget } from './spacing';
export { fontFamily, fontWeight, fontSize, lineHeight } from './typography';
export { shadows } from './shadows';

import { colors } from './colors';
import { spacing, radius } from './spacing';
import { fontFamily, fontWeight, fontSize, lineHeight } from './typography';
import { shadows } from './shadows';

export const theme = {
  colors,
  spacing,
  radius,
  fontFamily,
  fontWeight,
  fontSize,
  lineHeight,
  shadows,
} as const;

export type Theme = typeof theme;

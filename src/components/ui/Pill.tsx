'use client';

import styled from '@emotion/styled';
import { colors, radius } from '@/theme';

interface PillProps {
  color?: string;
  bg?:    string;
}

export const Pill = styled.span<PillProps>`
  display:       inline-flex;
  align-items:   center;
  gap:           6px;
  padding:       6px 11px;
  border-radius: ${radius.pill};
  background:    ${({ bg = colors.surface2 }) => bg};
  color:         ${({ color = colors.ink700 }) => color};
  font-size:     12.5px;
  font-weight:   600;
  white-space:   nowrap;
  line-height:   1;
`;

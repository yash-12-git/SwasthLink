'use client';

import styled from '@emotion/styled';
import { colors, radius, shadows } from '@/theme';

interface CardProps {
  pad?:    string;
  hover?:  boolean;
  accent?: string;
}

export const Card = styled.div<CardProps>`
  background:    ${colors.surface};
  border-radius: ${radius.md};
  border:        1px solid ${colors.border};
  padding:       ${({ pad = '20px' }) => pad};
  box-shadow:    ${shadows.sm};
  transition:    box-shadow 0.18s ease, transform 0.18s ease, border-color 0.18s ease;
  border-left:   ${({ accent }) => accent ? `4px solid ${accent}` : undefined};
  cursor:        ${({ hover }) => (hover ? 'pointer' : 'default')};

  ${({ hover }) =>
    hover &&
    `
    &:hover {
      box-shadow: 0 4px 12px rgba(16,32,46,0.08), 0 16px 40px rgba(16,32,46,0.08);
      transform: translateY(-2px);
      border-color: ${colors.borderStrong};
    }
  `}
`;

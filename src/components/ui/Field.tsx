'use client';

import React, { useState } from 'react';
import styled from '@emotion/styled';
import { colors, radius, touchTarget } from '@/theme';

// ── Label ──────────────────────────────────────────────────────────────────
const Label = styled.label`
  display:     block;
  font-size:   14px;
  font-weight: 700;
  color:       ${colors.ink700};
  margin-bottom: 8px;
`;

const Hint = styled.p`
  font-size:  12.5px;
  color:      ${colors.ink500};
  margin:     6px 0 0;
`;

// ── Text input ──────────────────────────────────────────────────────────────
interface WrapProps { focused: boolean }
const InputWrap = styled.div<WrapProps>`
  display:       flex;
  align-items:   center;
  gap:           10px;
  height:        56px;
  padding:       0 16px;
  border-radius: ${radius.sm};
  background:    ${colors.surface};
  border:        1.5px solid ${({ focused }) => focused ? colors.primary : colors.border};
  box-shadow:    ${({ focused }) => focused ? `0 0 0 3px ${colors.primary50}` : 'none'};
  transition:    border-color 0.15s, box-shadow 0.15s;
`;

const StyledInput = styled.input`
  flex:           1;
  border:         none;
  outline:        none;
  background:     transparent;
  font-size:      16px;
  font-weight:    600;
  color:          ${colors.ink};
  font-family:    inherit;
  min-width:      0;
  -webkit-appearance: none;
`;

interface TextFieldProps {
  label?:       string;
  hint?:        string;
  error?:       string;
  icon?:        React.ReactNode;
  inputMode?:   React.HTMLAttributes<HTMLInputElement>['inputMode'];
  type?:        string;
  placeholder?: string;
  autoFocus?:   boolean;
  value?:       string;
  onChange?:    (v: string) => void;
}

export function TextField({
  label, hint, error, icon,
  inputMode, type = 'text', placeholder,
  autoFocus, value = '', onChange,
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      {label && <Label>{label}</Label>}
      <InputWrap focused={focused}>
        {icon && <span style={{ color: focused ? colors.primary : colors.ink400, display: 'flex' }}>{icon}</span>}
        <StyledInput
          type={type}
          inputMode={inputMode}
          placeholder={placeholder}
          autoFocus={autoFocus}
          value={value}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => onChange?.(e.target.value)}
        />
      </InputWrap>
      {error && <Hint style={{ color: colors.danger }}>{error}</Hint>}
      {!error && hint && <Hint>{hint}</Hint>}
    </div>
  );
}

// ── Segmented options (gender, etc.) ────────────────────────────────────────
interface Option { value: string; label: string; sub?: string }

interface SegmentedFieldProps {
  label?:   string;
  options:  Option[];
  value?:   string;
  error?:   string;
  onChange: (v: string) => void;
}

const SegBtn = styled.button<{ active: boolean }>`
  height:        52px;
  border-radius: ${radius.sm};
  font-weight:   700;
  font-size:     15px;
  font-family:   inherit;
  cursor:        pointer;
  display:       flex;
  flex-direction:column;
  align-items:   center;
  justify-content:center;
  gap:           2px;
  transition:    all 0.15s ease;
  min-height:    ${touchTarget};

  background: ${({ active }) => active ? colors.primary50 : colors.surface};
  border:     1.5px solid ${({ active }) => active ? colors.primary : colors.border};
  color:      ${({ active }) => active ? colors.primary : colors.ink700};
`;

export function SegmentedField({ label, options, value, error, onChange }: SegmentedFieldProps) {
  return (
    <div>
      {label && <Label>{label}</Label>}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${options.length}, 1fr)`, gap: '8px' }}>
        {options.map((o) => (
          <SegBtn key={o.value} active={value === o.value} onClick={() => onChange(o.value)} type="button">
            {o.label}
            {o.sub && <span style={{ fontSize: '11px', fontWeight: 600, opacity: 0.7 }}>{o.sub}</span>}
          </SegBtn>
        ))}
      </div>
      {error && <Hint style={{ color: colors.danger }}>{error}</Hint>}
    </div>
  );
}

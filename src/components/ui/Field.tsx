'use client';

import React, { useState } from 'react';
import { colors, radius, touchTarget } from '@/theme';

// ── Text field ──────────────────────────────────────────────────────────────

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
      {label && (
        <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: colors.ink700, marginBottom: 8 }}>
          {label}
        </label>
      )}
      <div
        style={{
          display:      'flex',
          alignItems:   'center',
          gap:          10,
          height:       56,
          padding:      '0 16px',
          borderRadius: radius.sm,
          background:   colors.surface,
          border:       `1.5px solid ${focused ? colors.primary : colors.border}`,
          boxShadow:    focused ? `0 0 0 3px ${colors.primary50}` : 'none',
          transition:   'border-color 0.15s, box-shadow 0.15s',
        }}
      >
        {icon && (
          <span style={{ color: focused ? colors.primary : colors.ink400, display: 'flex' }}>
            {icon}
          </span>
        )}
        <input
          type={type}
          inputMode={inputMode}
          placeholder={placeholder}
          autoFocus={autoFocus}
          value={value}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => onChange?.(e.target.value)}
          style={{
            flex:              1,
            border:            'none',
            outline:           'none',
            background:        'transparent',
            fontSize:          16,
            fontWeight:        600,
            color:             colors.ink,
            fontFamily:        'inherit',
            minWidth:          0,
            WebkitAppearance:  'none',
          } as React.CSSProperties}
        />
      </div>
      {(error || hint) && (
        <p style={{ fontSize: 12.5, color: error ? colors.danger : colors.ink500, margin: '6px 0 0' }}>
          {error ?? hint}
        </p>
      )}
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

export function SegmentedField({ label, options, value, error, onChange }: SegmentedFieldProps) {
  return (
    <div>
      {label && (
        <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: colors.ink700, marginBottom: 8 }}>
          {label}
        </label>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${options.length}, 1fr)`, gap: 8 }}>
        {options.map((o) => {
          const active = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(o.value)}
              style={{
                height:          52,
                borderRadius:    radius.sm,
                fontWeight:      700,
                fontSize:        15,
                fontFamily:      'inherit',
                cursor:          'pointer',
                display:         'flex',
                flexDirection:   'column',
                alignItems:      'center',
                justifyContent:  'center',
                gap:             2,
                minHeight:       touchTarget,
                background:      active ? colors.primary50 : colors.surface,
                border:          `1.5px solid ${active ? colors.primary : colors.border}`,
                color:           active ? colors.primary : colors.ink700,
              }}
            >
              {o.label}
              {o.sub && <span style={{ fontSize: 11, fontWeight: 600, opacity: 0.7 }}>{o.sub}</span>}
            </button>
          );
        })}
      </div>
      {error && (
        <p style={{ fontSize: 12.5, color: colors.danger, margin: '6px 0 0' }}>{error}</p>
      )}
    </div>
  );
}

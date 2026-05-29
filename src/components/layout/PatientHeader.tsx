'use client';

import React from 'react';
import { ShieldCheck, Bell } from 'lucide-react';
import { colors } from '@/theme';
import { usePatientStore } from '@/store/patientStore';
import type { Locale } from '@/lib/i18n';

const HOSPITAL_NAME = process.env.NEXT_PUBLIC_HOSPITAL_NAME ?? 'District General Hospital';
const HOSPITAL_TAGLINE = process.env.NEXT_PUBLIC_HOSPITAL_TAGLINE ?? 'Govt. of India · जिला अस्पताल';

export function PatientHeader() {
  const { locale, setLocale } = usePatientStore();

  const toggleLocale = () => {
    const next: Locale = locale === 'en' ? 'hi' : 'en';
    setLocale(next);
  };

  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
        padding:    '16px 18px 18px',
        color:      '#fff',
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        {/* Emblem */}
        <div
          style={{
            width: 38, height: 38, borderRadius: 11,
            background: 'rgba(255,255,255,.16)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid rgba(255,255,255,.25)', flexShrink: 0,
          }}
        >
          <ShieldCheck size={22} color="#fff" />
        </div>

        {/* Name */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 800, lineHeight: 1.15 }}>{HOSPITAL_NAME}</div>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: 'rgba(255,255,255,.72)' }}>{HOSPITAL_TAGLINE}</div>
        </div>

        {/* Language switcher */}
        <button
          onClick={toggleLocale}
          style={{
            background:   'rgba(255,255,255,.14)',
            border:       '1px solid rgba(255,255,255,.25)',
            borderRadius: '999px',
            padding:      '5px 12px',
            color:        '#fff',
            fontSize:     12,
            fontWeight:   700,
            cursor:       'pointer',
            fontFamily:   'inherit',
          }}
        >
          {locale === 'en' ? 'हिंदी' : 'EN'}
        </button>

        {/* Notification bell */}
        <div style={{ position: 'relative', width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Bell size={18} color="#fff" />
          <span style={{ position: 'absolute', top: 8, right: 8, width: 7, height: 7, borderRadius: '50%', background: colors.warning, border: '1.5px solid #1565C0' }} />
        </div>
      </div>
    </div>
  );
}

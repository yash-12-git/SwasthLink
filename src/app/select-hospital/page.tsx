'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, ChevronRight, MapPin, QrCode } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { colors, radius } from '@/theme';
import { usePatientStore } from '@/store/patientStore';
import { listHospitals } from '@/services/hospitalService';
import type { Hospital } from '@/types/hospital';

export default function SelectHospitalPage() {
  const router      = useRouter();
  const setHospital = usePatientStore((s) => s.setHospital);
  const hospital    = usePatientStore((s) => s.hospital);

  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading]     = useState(true);

  // If a hospital is already set (e.g. user navigated here manually), go home
  useEffect(() => {
    if (hospital.id) router.replace('/');
  }, [hospital.id, router]);

  useEffect(() => {
    listHospitals()
      .then(setHospitals)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (h: Hospital) => {
    setHospital(h);
    router.push('/');
  };

  return (
    <MobileLayout>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 0 32px' }}>

        {/* Header */}
        <div style={{
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
          padding: '28px 20px 32px',
          color: '#fff',
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: 'rgba(255,255,255,.16)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 14,
          }}>
            <Building2 size={28} color="#fff" />
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.2 }}>
            अपना अस्पताल चुनें
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,.78)', marginTop: 4 }}>
            Select your hospital to continue
          </div>
        </div>

        {/* QR hint */}
        <div style={{
          margin: '16px 16px 4px',
          background: '#E3F2FD',
          borderRadius: radius.md,
          padding: '12px 14px',
          display: 'flex', alignItems: 'flex-start', gap: 10,
        }}>
          <QrCode size={18} color={colors.primary} style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ margin: 0, fontSize: 12.5, color: colors.primary, fontWeight: 600, lineHeight: 1.5 }}>
            Tip: Scan the QR code at the hospital entrance for automatic selection.
          </p>
        </div>

        {/* Hospital list */}
        <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{
                height: 80, borderRadius: radius.md,
                background: colors.surface2,
                animation: 'pulse 1.5s ease-in-out infinite',
              }} />
            ))
          ) : hospitals.length === 0 ? (
            <p style={{ textAlign: 'center', color: colors.ink400, fontWeight: 600, marginTop: 32 }}>
              No hospitals found. Please contact support.
            </p>
          ) : (
            hospitals.map((h) => (
              <button
                key={h.id}
                onClick={() => handleSelect(h)}
                style={{
                  width: '100%', textAlign: 'left',
                  background: colors.surface,
                  border: `1.5px solid ${colors.border}`,
                  borderRadius: radius.md,
                  padding: '14px 16px',
                  display: 'flex', alignItems: 'center', gap: 14,
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(16,32,46,.06)',
                }}
              >
                <div style={{
                  width: 46, height: 46, borderRadius: 12, flexShrink: 0,
                  background: '#E3F2FD',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Building2 size={22} color={colors.primary} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: colors.ink, lineHeight: 1.2 }}>
                    {h.name}
                  </div>
                  {h.name_hi && (
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: colors.ink500 }}>
                      {h.name_hi}
                    </div>
                  )}
                  {h.city && (
                    <div style={{ fontSize: 12, color: colors.ink400, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <MapPin size={11} />
                      {h.city}
                    </div>
                  )}
                </div>

                <ChevronRight size={20} color={colors.ink400} style={{ flexShrink: 0 }} />
              </button>
            ))
          )}
        </div>
      </div>
    </MobileLayout>
  );
}

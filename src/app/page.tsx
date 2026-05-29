'use client';

import React from 'react';
import Link from 'next/link';
import { QrCode, RefreshCw, Users, ChevronRight, Phone } from 'lucide-react';
import { MobileLayout }   from '@/components/layout/MobileLayout';
import { PatientHeader }  from '@/components/layout/PatientHeader';
import { BottomNav }      from '@/components/layout/BottomNav';
import { Card }           from '@/components/ui/Card';
import { Button }         from '@/components/ui/Button';
import { Pill }           from '@/components/ui/Pill';
import { SectionLabel }   from '@/components/ui/SectionLabel';
import { QueueWidget }    from '@/components/patient/QueueWidget';
import { colors, radius } from '@/theme';
import { MOCK_DEPARTMENTS } from '@/lib/mockData';
import { useTranslation } from '@/hooks/useTranslation';
import { usePatientStore } from '@/store/patientStore';
import { useQueueStore }   from '@/store/queueStore';

const HELPDESK = process.env.NEXT_PUBLIC_HELPDESK_PHONE ?? '1800-180-1104';

// Dept icon colours for the grid (subset)
const DEPT_COLORS = ['#1565C0', '#6A3FB8', '#0E7C7B', '#D32F2F', '#ED6C02'];
const DEPT_BG     = ['#E3F2FD', '#EFE8FA', '#E2F4F3', '#FFEBEE', '#FFF3E0'];

export default function LandingPage() {
  const { t }       = useTranslation();
  const activeEntry = usePatientStore((s) => s.activeEntry);
  const live        = useQueueStore((s) => s.live);

  // Show the token being served in the mini overview. Mock for now.
  const servingLabel = 'G-042';
  const cardioLabel  = 'C-118';

  return (
    <MobileLayout>
      <PatientHeader />

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ── Persistent queue widget (if patient has active token) ── */}
        {activeEntry && live && (
          <Link href="/track" style={{ textDecoration: 'none' }}>
            <QueueWidget variant="banner" />
          </Link>
        )}

        {/* ── Hero card ───────────────────────────────────────────── */}
        <Card style={{ position: 'relative', overflow: 'hidden' }}>
          <Pill bg={colors.success50} color={colors.success} style={{ marginBottom: 12 }}>
            <QrCode size={13} /> {t('landing.qrScanned')}
          </Pill>
          <div style={{ fontSize: 25, fontWeight: 800, color: colors.ink, lineHeight: 1.15 }}>
            {t('landing.welcome')}
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: colors.ink500, marginBottom: 14 }}>
            {t('landing.subtitle')}
          </div>
          <Link href="/register" style={{ textDecoration: 'none', display: 'block' }}>
            <Button full size="lg">
              <QrCode size={20} /> {t('landing.getToken')} <ChevronRight size={20} />
            </Button>
          </Link>
        </Card>

        {/* ── Live queue overview ──────────────────────────────────── */}
        <div>
          <SectionLabel action={
            <Pill bg={colors.success50} color={colors.success}>
              <RefreshCw size={12} /> {t('landing.liveLabel')}
            </Pill>
          }>
            {t('landing.nowServing')}
          </SectionLabel>
          <div style={{ display: 'flex', gap: 12 }}>
            {[
              { dept: 'General OPD', label: servingLabel, color: colors.primary },
              { dept: 'Cardiology',  label: cardioLabel,  color: colors.danger  },
            ].map((item) => (
              <Card key={item.dept} pad="14px" style={{ flex: 1 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: colors.ink700, marginBottom: 8 }}>{item.dept}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: item.color, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 11.5, color: colors.ink500, fontWeight: 600, marginTop: 3 }}>
                  {t('landing.tokenServing')}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* ── Departments grid ─────────────────────────────────────── */}
        <div>
          <SectionLabel action={
            <Link href="/department" style={{ textDecoration: 'none', color: colors.primary, fontWeight: 700, fontSize: 13 }}>
              {t('landing.seeAll')}
            </Link>
          }>
            {t('landing.departments')}
          </SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {MOCK_DEPARTMENTS.slice(0, 5).map((d, i) => (
              <Link key={d.id} href="/register" style={{ textDecoration: 'none' }}>
                <div style={{
                  background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: radius.md,
                  padding: '14px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  boxShadow: '0 1px 2px rgba(16,32,46,.06)',
                }}>
                  <div style={{ width: 42, height: 42, borderRadius: radius.md, background: DEPT_BG[i], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={22} color={DEPT_COLORS[i]} />
                  </div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: colors.ink700, textAlign: 'center', lineHeight: 1.1 }}>{d.name}</div>
                </div>
              </Link>
            ))}
            <Link href="/department" style={{ textDecoration: 'none' }}>
              <div style={{
                background: colors.surface2, border: `1px dashed ${colors.borderStrong}`, borderRadius: radius.md,
                padding: '14px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              }}>
                <div style={{ width: 42, height: 42, borderRadius: radius.md, background: colors.surface, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ChevronRight size={22} color={colors.ink500} />
                </div>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: colors.ink500, textAlign: 'center' }}>{t('landing.more')}</div>
              </div>
            </Link>
          </div>
        </div>

        {/* ── Help card ───────────────────────────────────────────── */}
        <Link href="/help" style={{ textDecoration: 'none' }}>
          <Card hover pad="14px" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: radius.md, background: colors.success50, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Phone size={22} color={colors.success} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14.5, fontWeight: 800, color: colors.ink }}>{t('landing.helpCard.title')}</div>
              <div style={{ fontSize: 12.5, color: colors.ink500, fontWeight: 600 }}>
                {t('landing.helpCard.subtitle', { phone: HELPDESK })}
              </div>
            </div>
            <ChevronRight size={20} color={colors.ink400} />
          </Card>
        </Link>
      </div>

      <BottomNav />
    </MobileLayout>
  );
}

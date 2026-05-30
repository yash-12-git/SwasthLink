'use client';

import React from 'react';
import Link from 'next/link';
import { QrCode, RefreshCw, Users, ChevronRight, Phone, Ticket, Clock, User } from 'lucide-react';
import { MobileLayout }   from '@/components/layout/MobileLayout';
import { PatientHeader }  from '@/components/layout/PatientHeader';
import { BottomNav }      from '@/components/layout/BottomNav';
import { Card }           from '@/components/ui/Card';
import { Button }         from '@/components/ui/Button';
import { Pill }           from '@/components/ui/Pill';
import { SectionLabel }   from '@/components/ui/SectionLabel';
import { colors, radius } from '@/theme';
import { MOCK_DEPARTMENTS } from '@/lib/mockData';
import type { Department } from '@/types/department';
import { useTranslation } from '@/hooks/useTranslation';
import { usePatientStore } from '@/store/patientStore';

const HELPDESK = process.env.NEXT_PUBLIC_HELPDESK_PHONE ?? '1800-180-1104';

const DEPT_COLORS = ['#1565C0', '#6A3FB8', '#0E7C7B', '#D32F2F', '#ED6C02'];
const DEPT_BG     = ['#E3F2FD', '#EFE8FA', '#E2F4F3', '#FFEBEE', '#FFF3E0'];

export default function LandingPage() {
  const { t, locale }      = useTranslation();
  const account            = usePatientStore((s) => s.account);
  const familyMembers      = usePatientStore((s) => s.familyMembers);
  const selectedPatient    = usePatientStore((s) => s.selectedPatient);
  const setSelectedPatient = usePatientStore((s) => s.setSelectedPatient);
  const activeEntries      = usePatientStore((s) => s.activeEntries);

  const [departments, setDepartments] = React.useState<Department[]>(MOCK_DEPARTMENTS);
  const [liveOverview, setLiveOverview] = React.useState([
    { deptId: 'general', deptName: 'General OPD', deptNameHi: 'सामान्य ओपीडी', currentTokenLabel: '—', color: '#1565C0' },
    { deptId: 'cardio',  deptName: 'Cardiology',  deptNameHi: 'हृदय रोग',       currentTokenLabel: '—', color: '#D32F2F' },
  ]);

  React.useEffect(() => {
    import('@/services/departmentService').then(({ getDepartments, getLiveOverview }) => {
      getDepartments().then(setDepartments).catch(() => {});
      getLiveOverview().then(setLiveOverview).catch(() => {});
    });
  }, []);

  // Patients who currently have an active token
  const activeVisits = familyMembers.filter((p) => activeEntries[p.id]);

  // Smart routing:
  // - No account       → /register
  // - Account but no patient selected → /family
  // - Patient selected → /department (skip re-selection)
  const getTokenHref = !account.id
    ? '/register'
    : !selectedPatient
    ? '/family'
    : '/department';

  // Department grid taps: go straight to doctor selection if patient is selected
  const deptHref = (deptId: string) =>
    selectedPatient ? `/doctor/${deptId}` : getTokenHref;

  return (
    <MobileLayout>
      <PatientHeader />

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ── "Visiting as" context bar ─────────────────────────────── */}
        {account.id && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: colors.surface,
            border: `1.5px solid ${selectedPatient ? colors.primary + '40' : colors.border}`,
            borderRadius: radius.md,
            padding: '10px 14px',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
              background: selectedPatient ? colors.primary : colors.surface2,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <User size={18} color={selectedPatient ? '#fff' : colors.ink400} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              {selectedPatient ? (
                <>
                  <div style={{ fontSize: 12, fontWeight: 600, color: colors.ink500 }}>Visiting as</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: colors.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selectedPatient.name}
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 12, fontWeight: 600, color: colors.ink500 }}>{account.mobile}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: colors.ink500 }}>No patient selected</div>
                </>
              )}
            </div>
            <Link href="/family" style={{ textDecoration: 'none', flexShrink: 0 }}>
              <span style={{
                fontSize: 13, fontWeight: 700, color: colors.primary,
                background: '#e8f0fe', borderRadius: 20, padding: '5px 12px',
              }}>
                {selectedPatient ? 'Change' : 'Select'}
              </span>
            </Link>
          </div>
        )}

        {/* ── Active visits (one banner per patient with active token) ── */}
        {activeVisits.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {activeVisits.map((patient) => {
              const entry = activeEntries[patient.id];
              return (
                <Link
                  key={patient.id}
                  href="/track"
                  onClick={() => setSelectedPatient(patient)}
                  style={{ textDecoration: 'none' }}
                >
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px',
                    background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`,
                    borderRadius: radius.md, color: '#fff',
                    boxShadow: '0 4px 12px rgba(21,101,192,0.28)',
                  }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Ticket size={22} color="#fff" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.8)' }}>
                        {patient.name}
                        {entry._departmentName ? ` · ${entry._departmentName}` : ''}
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Clock size={14} />
                        Token {entry.token_label} · Active
                      </div>
                    </div>
                    <ChevronRight size={20} color="rgba(255,255,255,.8)" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* ── Hero card ───────────────────────────────────────────── */}
        <Card style={{ position: 'relative' }}>
          <Pill bg={colors.success50} color={colors.success} style={{ marginBottom: 12 }}>
            <QrCode size={13} /> {t('landing.qrScanned')}
          </Pill>
          <div style={{ fontSize: 25, fontWeight: 800, color: colors.ink, lineHeight: 1.15 }}>
            {t('landing.welcome')}
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: colors.ink500, marginBottom: 14 }}>
            {t('landing.subtitle')}
          </div>
          <Link href={getTokenHref} style={{ textDecoration: 'none', display: 'block' }}>
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
            {liveOverview.map((item) => (
              <Card key={item.deptId} pad="14px" style={{ flex: 1 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: colors.ink700, marginBottom: 8 }}>
                  {locale === 'hi' && item.deptNameHi ? item.deptNameHi : item.deptName}
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: item.color, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                  {item.currentTokenLabel}
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
            {departments.slice(0, 5).map((d, i) => (
              <Link key={d.id} href={deptHref(d.id)} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: radius.md,
                  padding: '14px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  boxShadow: '0 1px 2px rgba(16,32,46,.06)',
                }}>
                  <div style={{ width: 42, height: 42, borderRadius: radius.md, background: DEPT_BG[i], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={22} color={DEPT_COLORS[i]} />
                  </div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: colors.ink700, textAlign: 'center', lineHeight: 1.1 }}>
                    {locale === 'hi' && d.nameHi ? d.nameHi : d.name}
                  </div>
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

'use client';

import React, { useReducer, useEffect } from 'react';
import styled from '@emotion/styled';
import { colors, radius, shadows } from '@/theme';
import { useAdminStore } from '@/store/adminStore';
import { useAdminQueue } from '@/hooks/useAdminQueue';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Avatar } from '@/components/ui/Avatar';
import { Alert } from '@/components/ui/Alert';
import type { AdminQueueEntry } from '@/types/staff';

// ── Helpers ──────────────────────────────────────────────────────────

function fmtSecs(ms: number) {
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

function fmtDate() {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
}

// ── Styled ───────────────────────────────────────────────────────────

const DashRoot = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 20px 24px;
  background: ${colors.bg};

  @media (max-width: 768px) {
    padding: 0;
    display: flex;
    flex-direction: column;
  }
`;

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
  gap: 12px;

  @media (max-width: 768px) {
    background: ${colors.surface};
    border-bottom: 1px solid ${colors.border};
    padding: 12px 14px;
    margin-bottom: 0;
    flex-wrap: wrap;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 16px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    padding: 10px 14px;
    margin-bottom: 0;
    background: ${colors.bg};
  }
`;

const StatCard = styled.div`
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  border-radius: ${radius.sm};
  padding: 10px 12px;
  text-align: center;

  @media (min-width: 769px) {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 16px;
    text-align: left;
    border-radius: ${radius.md};
    box-shadow: ${shadows.sm};
  }
`;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 12px 14px;
    gap: 12px;
    overflow-y: auto;
  }
`;

const ServingHero = styled.div<{ paused: boolean }>`
  border-radius: ${({ paused }) => paused ? `${radius.md} ${radius.md} 0 0` : `${radius.md} ${radius.md} 0 0`};
  background: ${({ paused }) =>
    paused
      ? colors.surface2
      : `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`};
  padding: 22px 24px;
  color: ${({ paused }) => paused ? colors.ink : '#fff'};

  @media (max-width: 768px) {
    border-radius: ${radius.lg};
    padding: 18px 20px;
  }
`;

const TokenBig = styled.div`
  font-size: 76px;
  font-weight: 800;
  line-height: 1.02;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
  margin: 4px 0;

  @media (max-width: 768px) { font-size: 64px; }
`;

const UpcomingRow = styled.div<{ isNext: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 16px;
  border-bottom: 1px solid ${colors.border};
  background: ${({ isNext }) => isNext ? colors.success50 : 'transparent'};
  transition: background 0.2s;

  &:last-of-type { border-bottom: none; }
`;

const MobileActionBar = styled.div`
  display: none;
  background: ${colors.surface};
  border-top: 1px solid ${colors.border};
  box-shadow: 0 -2px 16px rgba(16,32,46,0.06);
  padding: 12px 14px;
  gap: 12px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    display: flex;
  }
`;

const DesktopActions = styled.div`
  display: flex;
  gap: 10px;
  padding: 16px 20px;

  @media (max-width: 768px) {
    display: none;
  }
`;

// ── Sub-components ───────────────────────────────────────────────────

function StatIcon({ color }: { color: string }) {
  return (
    <div style={{
      width: 40, height: 40, borderRadius: radius.sm,
      background: colors.surface2, display: 'flex', alignItems: 'center',
      justifyContent: 'center', flexShrink: 0,
    }}>
      <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────

export function DoctorQueueDashboard() {
  const { session } = useAdminStore();
  const { queueState, next, skip, pause, recall } = useAdminQueue(session?.queueId);
  const [, tick] = useReducer((x: number) => x + 1, 0);

  // Tick every second for "Xs in consult" live counter
  useEffect(() => {
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  if (!session) return null;

  if (!queueState) {
    return (
      <DashRoot>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: colors.ink500 }}>
          Loading queue…
        </div>
      </DashRoot>
    );
  }

  const {
    currentTokenLabel, isPaused, skipped, lastCallAt, avgMins,
    upcoming, seenToday, doctorName, room, departmentName,
  } = queueState;

  const sinceCall  = Date.now() - lastCallAt;
  const nextEntry  = upcoming[0] as AdminQueueEntry | undefined;
  const nextLabel  = nextEntry?.label ?? '—';

  // Current patient is the one just called (currentToken)
  const currentPatient = {
    name: upcoming.length > 0
      ? upcoming[0].patientName  // next in line is displayed as "up next"
      : 'Queue Clear',
    label: currentTokenLabel,
  };

  const stats = [
    { label: 'In Queue', value: upcoming.length, color: colors.primary },
    { label: 'Seen Today', value: seenToday, color: colors.success },
    { label: 'Avg Consult', value: `${avgMins}m`, color: colors.ink },
    { label: 'Skipped', value: skipped.length, color: colors.warning },
  ];

  return (
    <DashRoot>
      {/* ── Header ─────────────────────────────────────────────────── */}
      <PageHeader>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: colors.ink }}>
            {departmentName} · {room}
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: colors.ink500 }}>
            {doctorName} · {fmtDate()}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <StatusBadge
            status={isPaused ? 'paused' : 'available'}
            pulse={!isPaused}
          />
          <Button
            size="sm"
            variant={isPaused ? 'success' : 'warning'}
            onClick={pause}
            aria-label={isPaused ? 'Resume queue' : 'Pause queue'}
          >
            {isPaused ? '▶ Resume' : '⏸ Pause'}
          </Button>
        </div>
      </PageHeader>

      {/* ── Stats ──────────────────────────────────────────────────── */}
      <StatsGrid>
        {stats.map((st) => (
          <StatCard key={st.label}>
            <StatIcon color={st.color} />
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: st.color, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                {st.value}
              </div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: colors.ink500, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {st.label}
              </div>
            </div>
          </StatCard>
        ))}
      </StatsGrid>

      {/* ── Main 2-col grid ────────────────────────────────────────── */}
      <MainGrid>
        {/* Now Serving card */}
        <Card pad="0" style={{ overflow: 'hidden' }}>
          <ServingHero paused={isPaused}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{
                fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em',
                color: isPaused ? colors.ink500 : 'rgba(255,255,255,0.8)',
              }}>
                Now Serving
              </span>
              <span style={{
                fontSize: 12, fontWeight: 700,
                background: isPaused ? colors.surface : 'rgba(255,255,255,0.16)',
                color: isPaused ? colors.ink700 : '#fff',
                padding: '4px 10px', borderRadius: radius.pill,
              }}>
                {fmtSecs(sinceCall)} in consult
              </span>
            </div>
            <TokenBig>{currentTokenLabel}</TokenBig>
            <div style={{ fontSize: 15, fontWeight: 700 }}>
              {currentPatient.name}
            </div>
          </ServingHero>

          {/* Desktop action buttons */}
          <DesktopActions>
            <Button
              size="lg"
              variant="success"
              full
              onClick={next}
              disabled={isPaused || upcoming.length === 0}
              aria-label="Call next patient"
            >
              ✓ Next Patient
            </Button>
            <Button
              size="lg"
              variant="ghost"
              style={{ flex: '0 0 auto', minWidth: 120 }}
              onClick={skip}
              disabled={upcoming.length === 0}
              aria-label="Skip next patient"
            >
              ↷ Skip
            </Button>
          </DesktopActions>

          {upcoming.length > 0 && (
            <div style={{ padding: '2px 20px 14px', fontSize: 12, fontWeight: 600, color: colors.ink500 }}>
              Next up: <strong style={{ color: colors.ink700 }}>{nextLabel}</strong>
              {nextEntry?.patientName ? ` · ${nextEntry.patientName}` : ''}
            </div>
          )}

          {isPaused && (
            <div style={{ padding: '0 20px 16px' }}>
              <Alert variant="warning">Queue is paused. Resume to call the next patient.</Alert>
            </div>
          )}
        </Card>

        {/* Upcoming list */}
        <Card pad="0" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{
            padding: '14px 16px', borderBottom: `1px solid ${colors.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: colors.ink }}>Upcoming</div>
            <span style={{
              fontSize: 12, fontWeight: 800, background: colors.primary50,
              color: colors.primary, padding: '3px 10px', borderRadius: radius.pill,
            }}>
              {upcoming.length} waiting
            </span>
          </div>

          <div style={{ overflow: 'auto', flex: 1 }}>
            {upcoming.length === 0 ? (
              <div style={{ padding: '24px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: colors.ink500 }}>
                Queue is clear — no one waiting.
              </div>
            ) : (
              upcoming.slice(0, 10).map((p, i) => (
                <UpcomingRow key={p.token} isNext={i === 0}>
                  <div style={{
                    fontSize: 14, fontWeight: 800,
                    color: i === 0 ? colors.success : colors.ink,
                    width: 56, fontVariantNumeric: 'tabular-nums',
                    flexShrink: 0,
                  }}>
                    {p.label}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: colors.ink700 }}>
                      {p.patientName}
                    </div>
                    {p.age && (
                      <div style={{ fontSize: 11.5, fontWeight: 600, color: colors.ink400 }}>
                        Age {p.age} · {p.gender}
                      </div>
                    )}
                  </div>
                  {i === 0 ? (
                    <span style={{ fontSize: 11.5, fontWeight: 800, background: colors.success50, color: colors.success, padding: '3px 9px', borderRadius: radius.pill }}>
                      up next
                    </span>
                  ) : (
                    <span style={{ fontSize: 12, fontWeight: 700, color: colors.ink400 }}>
                      #{i + 1}
                    </span>
                  )}
                </UpcomingRow>
              ))
            )}
          </div>

          {/* Skipped recall */}
          {skipped.length > 0 && (
            <div style={{
              borderTop: `1px solid ${colors.border}`,
              padding: '10px 16px',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: colors.warning, flex: 1 }}>
                Skipped: {skipped.map(s => s.label).join(', ')}
              </span>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => recall(skipped[skipped.length - 1].token)}
                aria-label="Recall last skipped patient"
              >
                Recall
              </Button>
            </div>
          )}
        </Card>
      </MainGrid>

      {/* ── Mobile action bar (fixed bottom) ──────────────────────── */}
      <MobileActionBar>
        <Button
          size="lg"
          variant="ghost"
          style={{ flex: 1 }}
          onClick={skip}
          disabled={upcoming.length === 0}
          aria-label="Skip next patient"
        >
          ↷ Skip
        </Button>
        <Button
          size="lg"
          variant="success"
          style={{ flex: 2 }}
          onClick={next}
          disabled={isPaused || upcoming.length === 0}
          aria-label={`Call ${nextLabel}`}
        >
          ✓ Call {nextLabel}
        </Button>
      </MobileActionBar>
    </DashRoot>
  );
}

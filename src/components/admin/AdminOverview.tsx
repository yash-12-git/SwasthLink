'use client';

import React, { useEffect, useReducer, useState, useCallback } from 'react';
import styled from '@emotion/styled';
import { colors, radius, shadows } from '@/theme';
import { getHospitalQueueOverview, toggleQueuePause } from '@/services/adminService';
import { useAdminStore } from '@/store/adminStore';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { DoctorQueueSummary } from '@/types/staff';

// ── Helpers ──────────────────────────────────────────────────────────

function secsSince(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

// ── Styled ───────────────────────────────────────────────────────────

const Root = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  background: ${colors.bg};
`;

const QueueGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
  margin-top: 16px;
`;

const DeptAccent: Record<string, string> = {
  general: colors.primary,
  ortho:   '#6A3FB8',
  ent:     '#0E7C7B',
  cardio:  colors.danger,
  skin:    colors.warning,
};

const QueueCard = styled(Card)<{ dept: string }>`
  padding: 0;
  overflow: hidden;
  border-left: 4px solid ${({ dept }) => DeptAccent[dept] ?? colors.primary};
`;

const CardHeader = styled.div`
  padding: 14px 16px;
  border-bottom: 1px solid ${colors.border};
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

const TokenBlock = styled.div<{ paused: boolean }>`
  padding: 14px 16px;
  background: ${({ paused }) => paused ? colors.surface2 : `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`};
  color: ${({ paused }) => paused ? colors.ink500 : '#fff'};
  display: flex;
  align-items: center;
  gap: 12px;
`;

const CardFooter = styled.div`
  padding: 10px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

// ── Component ────────────────────────────────────────────────────────

export function AdminOverview() {
  const { session } = useAdminStore();
  const [queues, setQueues] = useState<DoctorQueueSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [, tick] = useReducer((x: number) => x + 1, 0);

  const load = useCallback(async () => {
    if (!session?.hospitalId) return;
    const data = await getHospitalQueueOverview(session.hospitalId);
    setQueues(data);
    setLoading(false);
  }, [session?.hospitalId]);

  useEffect(() => {
    load();
    const t = setInterval(load, 10_000); // refresh every 10s
    return () => clearInterval(t);
  }, [load]);

  // Live "Xs ago" counter
  useEffect(() => {
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  const handleTogglePause = async (queueId: string) => {
    await toggleQueuePause(queueId);
    await load();
  };

  const totalInQueue = queues.reduce((sum, q) => sum + q.queueLength, 0);
  const activeQueues = queues.filter((q) => !q.isPaused).length;

  return (
    <Root>
      {/* ── Header ────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: colors.ink, margin: 0 }}>
            {session?.hospitalName ?? 'Hospital'} — Queue Overview
          </h1>
          <p style={{ fontSize: 13, fontWeight: 600, color: colors.ink500, margin: '4px 0 0' }}>
            All active queues · Live
          </p>
        </div>
        <Button size="sm" variant="ghost" onClick={load} aria-label="Refresh queues">
          ↻ Refresh
        </Button>
      </div>

      {/* ── Summary chips ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
        {[
          { label: 'Doctors Active', value: activeQueues, color: colors.success },
          { label: 'Total in Queue', value: totalInQueue, color: colors.primary },
          { label: 'Paused Queues', value: queues.filter((q) => q.isPaused).length, color: colors.warning },
        ].map((s) => (
          <div key={s.label} style={{
            background: colors.surface, border: `1px solid ${colors.border}`,
            borderRadius: radius.sm, padding: '8px 14px', display: 'flex',
            alignItems: 'center', gap: 8,
          }}>
            <span style={{ fontSize: 20, fontWeight: 800, color: s.color, fontVariantNumeric: 'tabular-nums' }}>
              {s.value}
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: colors.ink500 }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Queue cards grid ──────────────────────────────────────── */}
      {loading ? (
        <div style={{ color: colors.ink500, padding: '40px 0', textAlign: 'center' }}>Loading queues…</div>
      ) : queues.length === 0 ? (
        <div style={{ color: colors.ink500, padding: '40px 0', textAlign: 'center' }}>No active queues found.</div>
      ) : (
        <QueueGrid>
          {queues.map((q) => (
            <QueueCard key={q.queueId} dept={q.departmentId} hover>
              {/* Doctor info */}
              <CardHeader>
                <div style={{
                  width: 40, height: 40, borderRadius: radius.sm, flexShrink: 0,
                  background: DeptAccent[q.departmentId] ? `${DeptAccent[q.departmentId]}18` : colors.primary50,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 15, fontWeight: 800, color: DeptAccent[q.departmentId] ?? colors.primary,
                }}>
                  {q.doctorName.replace('Dr. ', '').split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 800, color: colors.ink }}>{q.doctorName}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: colors.ink500 }}>
                    {q.departmentName} · {q.room}
                  </div>
                </div>
                <StatusBadge status={q.isPaused ? 'paused' : 'available'} pulse={!q.isPaused} sm />
              </CardHeader>

              {/* Token hero */}
              <TokenBlock paused={q.isPaused}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', opacity: 0.7 }}>
                    Now Serving
                  </div>
                  <div style={{ fontSize: 40, fontWeight: 800, fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>
                    {q.currentTokenLabel}
                  </div>
                </div>
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', opacity: 0.7 }}>
                    In Queue
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 800, fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>
                    {q.queueLength}
                  </div>
                </div>
              </TokenBlock>

              {/* Footer */}
              <CardFooter>
                <span style={{ fontSize: 12, fontWeight: 600, color: colors.ink500 }}>
                  Last call {secsSince(q.lastCallAt)}
                </span>
                <Button
                  size="sm"
                  variant={q.isPaused ? 'success' : 'warning'}
                  onClick={() => handleTogglePause(q.queueId)}
                  aria-label={q.isPaused ? `Resume ${q.doctorName}'s queue` : `Pause ${q.doctorName}'s queue`}
                >
                  {q.isPaused ? '▶ Resume' : '⏸ Pause'}
                </Button>
              </CardFooter>
            </QueueCard>
          ))}
        </QueueGrid>
      )}
    </Root>
  );
}

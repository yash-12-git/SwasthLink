'use client';

import React, { useEffect, useReducer, useState } from 'react';
import styled from '@emotion/styled';
import { colors } from '@/theme';
import { getHospitalQueueOverview } from '@/services/adminService';
import { useAdminStore } from '@/store/adminStore';
import type { DoctorQueueSummary } from '@/types/staff';

// ── Styled ───────────────────────────────────────────────────────────

const TVRoot = styled.div`
  min-height: 100vh;
  background: #0D1B2A;
  color: #fff;
  display: flex;
  flex-direction: column;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
`;

const TVHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 40px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  flex-shrink: 0;
`;

const TVBody = styled.main`
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 2px;
  background: rgba(255,255,255,0.04);

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const QueuePanel = styled.div<{ paused: boolean }>`
  background: ${({ paused }) => paused ? '#111E2D' : '#0D1B2A'};
  padding: 28px 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
  opacity: ${({ paused }) => paused ? 0.6 : 1};

  /* subtle left accent bar */
  &::before {
    content: '';
    position: absolute;
    left: 0; top: 20px; bottom: 20px;
    width: 4px;
    border-radius: 0 4px 4px 0;
    background: ${({ paused }) => paused ? '#555' : colors.primary};
  }
`;

const DeptLabel = styled.div`
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(255,255,255,0.5);
`;

const DoctorLabel = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: rgba(255,255,255,0.85);
`;

const NowServingLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: rgba(255,255,255,0.45);
  margin-bottom: 2px;
`;

const BigToken = styled.div<{ paused: boolean }>`
  font-size: clamp(56px, 8vw, 96px);
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
  color: ${({ paused }) => paused ? 'rgba(255,255,255,0.35)' : '#fff'};
`;

const QueueCountRow = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
`;

const QueueCountItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const UpcomingList = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const UpcomingToken = styled.div<{ pos: number }>`
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(255,255,255,${({ pos }) => Math.max(0.06, 0.22 - pos * 0.05)});
  font-size: 16px;
  font-weight: 700;
  color: rgba(255,255,255,${({ pos }) => Math.max(0.4, 0.9 - pos * 0.15)});
  font-variant-numeric: tabular-nums;
`;

const PausedBanner = styled.div`
  background: rgba(211,47,47,0.15);
  border: 1px solid rgba(211,47,47,0.3);
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 700;
  color: #FF6B6B;
  text-transform: uppercase;
  letter-spacing: 0.06em;
`;

const TVFooter = styled.footer`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 40px;
  border-top: 1px solid rgba(255,255,255,0.06);
  flex-shrink: 0;
`;

// ── Helpers ──────────────────────────────────────────────────────────

function LiveClock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ fontSize: 24, fontWeight: 800, color: 'rgba(255,255,255,0.7)', fontVariantNumeric: 'tabular-nums' }}>
      {time}
    </div>
  );
}

const DEPT_COLORS: Record<string, string> = {
  general: '#1565C0', ortho: '#6A3FB8', ent: '#0E7C7B',
  cardio: '#D32F2F', skin: '#ED6C02',
};

// ── Component ────────────────────────────────────────────────────────

export function TVDisplay({ hospitalId, hospitalName }: { hospitalId?: string; hospitalName?: string }) {
  const { session } = useAdminStore();
  const hId   = hospitalId ?? session?.hospitalId ?? 'mock-hospital';
  const hName = hospitalName ?? session?.hospitalName ?? 'District General Hospital';

  const [queues, setQueues] = useState<DoctorQueueSummary[]>([]);
  const [, tick] = useReducer((n: number) => n + 1, 0);

  useEffect(() => {
    const load = () => getHospitalQueueOverview(hId).then(setQueues);
    load();
    const t = setInterval(load, 8_000);
    return () => clearInterval(t);
  }, [hId]);

  // Live counter tick
  useEffect(() => {
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <TVRoot>
      <TVHeader>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>{hName}</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>
            OPD Queue Display · Live
          </div>
        </div>
        <LiveClock />
      </TVHeader>

      <TVBody>
        {queues.length === 0 ? (
          <div style={{ padding: 40, color: 'rgba(255,255,255,0.4)', fontSize: 18, textAlign: 'center', gridColumn: '1/-1' }}>
            No active queues
          </div>
        ) : (
          queues.map((q) => (
            <QueuePanel key={q.queueId} paused={q.isPaused}>
              <div>
                <DeptLabel style={{ color: DEPT_COLORS[q.departmentId] ?? colors.primary }}>
                  {q.departmentName}
                </DeptLabel>
                <DoctorLabel>{q.doctorName} · {q.room}</DoctorLabel>
              </div>

              <div>
                <NowServingLabel>Now Serving</NowServingLabel>
                <BigToken paused={q.isPaused}>{q.currentTokenLabel}</BigToken>
              </div>

              <QueueCountRow>
                <QueueCountItem>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)' }}>
                    Waiting
                  </div>
                  <div style={{ fontSize: 32, fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: 'rgba(255,255,255,0.85)' }}>
                    {q.queueLength}
                  </div>
                </QueueCountItem>
              </QueueCountRow>

              {q.isPaused && <PausedBanner>⏸ Paused — Please wait</PausedBanner>}
            </QueuePanel>
          ))
        )}
      </TVBody>

      <TVFooter>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.3)' }}>
          SwasthLink · Queue Management System
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2E7D32', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)' }}>Live</span>
        </div>
      </TVFooter>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&display=swap');
      `}</style>
    </TVRoot>
  );
}

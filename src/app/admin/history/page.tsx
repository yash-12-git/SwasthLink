'use client';

import React, { useCallback, useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { colors, radius } from '@/theme';
import { useAdminStore } from '@/store/adminStore';
import { getQueueHistory, getHospitalQueueOverview } from '@/services/adminService';
import type { HistoryEntry, HistoryFilters } from '@/services/adminService';
import type { DoctorQueueSummary } from '@/types/staff';

// ── Helpers ───────────────────────────────────────────────────────────

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

// ── Styled ────────────────────────────────────────────────────────────

const Root = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px 28px;
  background: ${colors.bg};

  @media (max-width: 768px) { padding: 14px 12px; }
`;

const PageHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 12px;
  flex-wrap: wrap;
`;

const FilterBar = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  border-radius: ${radius.md};
  padding: 12px 16px;
  margin-bottom: 16px;
`;

const FilterSelect = styled.select`
  height: 36px;
  border: 1px solid ${colors.border};
  border-radius: ${radius.sm};
  background: ${colors.bg};
  color: ${colors.ink};
  font-size: 13.5px;
  font-weight: 600;
  padding: 0 10px;
  cursor: pointer;
  outline: none;
  &:focus { border-color: ${colors.primary}; }
`;

const FilterInput = styled.input`
  height: 36px;
  border: 1px solid ${colors.border};
  border-radius: ${radius.sm};
  background: ${colors.bg};
  color: ${colors.ink};
  font-size: 13.5px;
  font-weight: 600;
  padding: 0 10px;
  cursor: pointer;
  outline: none;
  &:focus { border-color: ${colors.primary}; }
`;

const ResetBtn = styled.button`
  height: 36px;
  padding: 0 14px;
  border: 1px solid ${colors.border};
  border-radius: ${radius.sm};
  background: ${colors.surface2};
  color: ${colors.ink500};
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  &:hover { background: ${colors.border}; color: ${colors.ink}; }
`;

const StatsRow = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

const StatChip = styled.div<{ accent: string }>`
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  border-left: 3px solid ${({ accent }) => accent};
  border-radius: ${radius.sm};
  padding: 8px 14px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Table = styled.div`
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  border-radius: ${radius.md};
  overflow: hidden;
`;

const Row = styled.div<{ header?: boolean; skipped?: boolean }>`
  display: grid;
  grid-template-columns: 90px 1fr 100px 1fr 1fr 80px 80px;
  gap: 10px;
  padding: 11px 16px;
  border-bottom: 1px solid ${colors.border};
  align-items: center;
  background: ${({ header, skipped }) =>
    header ? colors.surface2 : skipped ? '#fffbf2' : colors.surface};
  font-size: ${({ header }) => header ? '11px' : '13.5px'};
  font-weight: ${({ header }) => header ? 700 : 500};
  color: ${({ header }) => header ? colors.ink500 : colors.ink700};
  text-transform: ${({ header }) => header ? 'uppercase' : 'none'};
  letter-spacing: ${({ header }) => header ? '0.05em' : 'normal'};

  &:last-of-type { border-bottom: none; }

  @media (max-width: 900px) {
    grid-template-columns: 80px 1fr 1fr 70px 70px;
  }
  @media (max-width: 600px) {
    grid-template-columns: 72px 1fr 1fr 64px;
  }
`;

const DoctorRow = styled.div<{ header?: boolean; skipped?: boolean }>`
  display: grid;
  grid-template-columns: 90px 1fr 100px 1fr 80px;
  gap: 10px;
  padding: 11px 16px;
  border-bottom: 1px solid ${colors.border};
  align-items: center;
  background: ${({ header, skipped }) =>
    header ? colors.surface2 : skipped ? '#fffbf2' : colors.surface};
  font-size: ${({ header }) => header ? '11px' : '13.5px'};
  font-weight: ${({ header }) => header ? 700 : 500};
  color: ${({ header }) => header ? colors.ink500 : colors.ink700};
  text-transform: ${({ header }) => header ? 'uppercase' : 'none'};
  letter-spacing: ${({ header }) => header ? '0.05em' : 'normal'};
  &:last-of-type { border-bottom: none; }
`;

const TokenPill = styled.span<{ skipped?: boolean }>`
  font-size: 12.5px;
  font-weight: 800;
  color: ${({ skipped }) => skipped ? colors.warning : colors.primary};
  background: ${({ skipped }) => skipped ? '#fff3e0' : colors.primary50};
  border-radius: ${radius.pill};
  padding: 3px 9px;
  font-variant-numeric: tabular-nums;
`;

const StatusBadge = styled.span<{ done: boolean }>`
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: ${radius.pill};
  background: ${({ done }) => done ? colors.success50 : '#fff3e0'};
  color: ${({ done }) => done ? colors.success : colors.warning};
`;

const GenderBadge = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: ${colors.ink400};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px 24px;
  color: ${colors.ink500};
  font-size: 14px;
  font-weight: 600;
`;

// ── Component ─────────────────────────────────────────────────────────

export default function HistoryPage() {
  const session  = useAdminStore((s) => s.session);
  const isAdmin  = session?.role === 'admin' || session?.role === 'superadmin';

  const [entries,  setEntries]  = useState<HistoryEntry[]>([]);
  const [doctors,  setDoctors]  = useState<DoctorQueueSummary[]>([]);
  const [loading,  setLoading]  = useState(true);

  // Filters (admin only)
  const [filterDate,   setFilterDate]   = useState(todayISO());
  const [filterDoctor, setFilterDoctor] = useState('');
  const [filterDept,   setFilterDept]   = useState('');

  // Unique departments derived from doctor list
  const deptOptions = Array.from(
    new Map(doctors.map((d) => [d.departmentId, d.departmentName])).entries(),
  );

  const load = useCallback(async () => {
    if (!session) return;
    setLoading(true);

    const filters: HistoryFilters = {
      date:         filterDate,
      hospitalId:   session.hospitalId,
      queueId:      isAdmin ? undefined : (session.queueId ?? undefined),
      doctorId:     isAdmin && filterDoctor ? filterDoctor : undefined,
      departmentId: isAdmin && filterDept   ? filterDept   : undefined,
    };

    const data = await getQueueHistory(filters);
    setEntries(data);
    setLoading(false);
  }, [session, isAdmin, filterDate, filterDoctor, filterDept]);

  // Load doctor list for filter dropdowns (admin only)
  useEffect(() => {
    if (!session || !isAdmin) return;
    getHospitalQueueOverview(session.hospitalId).then(setDoctors).catch(() => {});
  }, [session, isAdmin]);

  useEffect(() => { load(); }, [load]);

  const done    = entries.filter((e) => e.status === 'done').length;
  const skipped = entries.filter((e) => e.status === 'skipped').length;

  const displayDate = new Date(filterDate).toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  const resetFilters = () => {
    setFilterDate(todayISO());
    setFilterDoctor('');
    setFilterDept('');
  };

  return (
    <Root>
      <PageHeader>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: colors.ink }}>Queue History</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: colors.ink500, marginTop: 2 }}>
            {isAdmin ? session?.hospitalName : `${session?.departmentName} · ${session?.name}`} · {displayDate}
          </div>
        </div>
      </PageHeader>

      {/* ── Filters (admin only) ──────────────────────────────────── */}
      {isAdmin && (
        <FilterBar>
          <span style={{ fontSize: 12, fontWeight: 700, color: colors.ink500, marginRight: 4 }}>Filter by</span>

          <FilterInput
            type="date"
            value={filterDate}
            max={todayISO()}
            onChange={(e) => setFilterDate(e.target.value)}
          />

          <FilterSelect value={filterDoctor} onChange={(e) => setFilterDoctor(e.target.value)}>
            <option value="">All Doctors</option>
            {doctors.map((d) => (
              <option key={d.doctorId} value={d.doctorId}>{d.doctorName}</option>
            ))}
          </FilterSelect>

          <FilterSelect value={filterDept} onChange={(e) => setFilterDept(e.target.value)}>
            <option value="">All Departments</option>
            {deptOptions.map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </FilterSelect>

          {(filterDoctor || filterDept || filterDate !== todayISO()) && (
            <ResetBtn onClick={resetFilters}>✕ Reset</ResetBtn>
          )}
        </FilterBar>
      )}

      {/* ── Summary stats ─────────────────────────────────────────── */}
      {!loading && (
        <StatsRow>
          <StatChip accent={colors.success}>
            <span style={{ fontSize: 20, fontWeight: 800, color: colors.success }}>{done}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: colors.ink500 }}>Completed</span>
          </StatChip>
          <StatChip accent={colors.warning}>
            <span style={{ fontSize: 20, fontWeight: 800, color: colors.warning }}>{skipped}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: colors.ink500 }}>Skipped</span>
          </StatChip>
          <StatChip accent={colors.primary}>
            <span style={{ fontSize: 20, fontWeight: 800, color: colors.primary }}>{entries.length}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: colors.ink500 }}>Total</span>
          </StatChip>
        </StatsRow>
      )}

      {/* ── Table ─────────────────────────────────────────────────── */}
      {loading ? (
        <div style={{ color: colors.ink500, fontSize: 14, fontWeight: 600, padding: '20px 0' }}>Loading…</div>
      ) : entries.length === 0 ? (
        <Table><EmptyState>No entries found for this selection.</EmptyState></Table>
      ) : isAdmin ? (
        // Admin table — all columns + doctor + dept
        <Table>
          <Row header>
            <span>Token</span>
            <span>Patient</span>
            <span>Age / Gender</span>
            <span>Doctor</span>
            <span>Department</span>
            <span>Status</span>
            <span style={{ textAlign: 'right' }}>Time</span>
          </Row>
          {entries.map((e) => (
            <Row key={e.id} skipped={e.status === 'skipped'}>
              <TokenPill skipped={e.status === 'skipped'}>{e.tokenLabel}</TokenPill>
              <span style={{ fontWeight: 600 }}>{e.patientName}</span>
              <GenderBadge>
                {e.patientAge ? `${e.patientAge}y` : '—'}
                {e.patientGender ? ` · ${e.patientGender}` : ''}
              </GenderBadge>
              <span style={{ color: colors.ink500 }}>{e.doctorName}</span>
              <span style={{ color: colors.ink400, fontSize: 12.5 }}>{e.departmentName}</span>
              <StatusBadge done={e.status === 'done'}>{e.status === 'done' ? 'Done' : 'Skipped'}</StatusBadge>
              <span style={{ textAlign: 'right', color: colors.ink400, fontSize: 12.5 }}>{fmtTime(e.servedAt)}</span>
            </Row>
          ))}
        </Table>
      ) : (
        // Doctor table — their own patients only
        <Table>
          <DoctorRow header>
            <span>Token</span>
            <span>Patient</span>
            <span>Age / Gender</span>
            <span>Status</span>
            <span style={{ textAlign: 'right' }}>Time</span>
          </DoctorRow>
          {entries.map((e) => (
            <DoctorRow key={e.id} skipped={e.status === 'skipped'}>
              <TokenPill skipped={e.status === 'skipped'}>{e.tokenLabel}</TokenPill>
              <span style={{ fontWeight: 600 }}>{e.patientName}</span>
              <GenderBadge>
                {e.patientAge ? `${e.patientAge}y` : '—'}
                {e.patientGender ? ` · ${e.patientGender}` : ''}
              </GenderBadge>
              <StatusBadge done={e.status === 'done'}>{e.status === 'done' ? 'Done' : 'Skipped'}</StatusBadge>
              <span style={{ textAlign: 'right', color: colors.ink400, fontSize: 12.5 }}>{fmtTime(e.servedAt)}</span>
            </DoctorRow>
          ))}
        </Table>
      )}
    </Root>
  );
}

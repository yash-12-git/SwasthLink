'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styled from '@emotion/styled';
import { colors, radius } from '@/theme';
import { useAdminStore } from '@/store/adminStore';

const Bar = styled.nav`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 64px;
    background: ${colors.surface};
    border-top: 1px solid ${colors.border};
    box-shadow: 0 -2px 12px rgba(16,32,46,0.08);
    z-index: 100;
    align-items: stretch;
  }
`;

const Tab = styled(Link)<{ active?: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  text-decoration: none;
  color: ${({ active }) => active ? colors.primary : colors.ink400};
  font-size: 10.5px;
  font-weight: 700;
  position: relative;
  transition: color 0.15s;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 20%;
    right: 20%;
    height: 2px;
    border-radius: 0 0 2px 2px;
    background: ${({ active }) => active ? colors.primary : 'transparent'};
    transition: background 0.15s;
  }
`;

const Badge = styled.span`
  position: absolute;
  top: 8px;
  right: calc(50% - 20px);
  min-width: 16px;
  height: 16px;
  border-radius: 8px;
  background: ${colors.primary};
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
`;

function QueueIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
      <line x1="8" y1="18" x2="21" y2="18"/>
      <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  );
}
function GridIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  );
}
function TvIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/>
      <line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  );
}
function HistoryIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/>
      <polyline points="12 7 12 12 15 15"/>
    </svg>
  );
}

export function AdminMobileNav({ queueLength }: { queueLength?: number }) {
  const pathname = usePathname();
  const session  = useAdminStore((s) => s.session);
  const isAdmin  = session?.role === 'admin' || session?.role === 'superadmin';

  return (
    <Bar aria-label="Admin navigation">
      {session?.role === 'doctor' && (
        <Tab href="/admin/dashboard" active={pathname === '/admin/dashboard'} aria-current={pathname === '/admin/dashboard' ? 'page' : undefined}>
          <QueueIcon />
          Queue
          {queueLength != null && queueLength > 0 && <Badge>{queueLength}</Badge>}
        </Tab>
      )}
      {isAdmin && (
        <Tab href="/admin/overview" active={pathname === '/admin/overview'} aria-current={pathname === '/admin/overview' ? 'page' : undefined}>
          <GridIcon />
          All Queues
        </Tab>
      )}
      <Tab href="/admin/tv" active={pathname === '/admin/tv'} aria-current={pathname === '/admin/tv' ? 'page' : undefined}>
        <TvIcon />
        TV Display
      </Tab>
      <Tab href="/admin/history" active={pathname === '/admin/history'} aria-current={pathname === '/admin/history' ? 'page' : undefined}>
        <HistoryIcon />
        History
      </Tab>
    </Bar>
  );
}

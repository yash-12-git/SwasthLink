'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styled from '@emotion/styled';
import { colors, radius, shadows } from '@/theme';
import { useAdminStore } from '@/store/adminStore';
import { Avatar } from '@/components/ui/Avatar';
import { StatusBadge } from '@/components/ui/StatusBadge';

// ── Styled ───────────────────────────────────────────────────────────

const Sidebar = styled.nav`
  width: 232px;
  min-height: 100%;
  background: ${colors.surface};
  border-right: 1px solid ${colors.border};
  display: flex;
  flex-direction: column;
  padding: 18px 14px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    display: none;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 6px 20px;
  border-bottom: 1px solid ${colors.border};
  margin-bottom: 8px;
`;

const LogoMark = styled.div`
  width: 36px;
  height: 36px;
  border-radius: ${radius.sm};
  background: ${colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  svg { display: block; }
`;

const NavGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
`;

interface NavItemProps { active?: boolean }
const NavItem = styled(Link)<NavItemProps>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: ${radius.sm};
  background: ${({ active }) => active ? colors.primary50 : 'transparent'};
  color: ${({ active }) => active ? colors.primary : colors.ink500};
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  transition: background 0.15s, color 0.15s;
  min-height: 44px;

  &:hover {
    background: ${({ active }) => active ? colors.primary50 : colors.surface2};
    color: ${({ active }) => active ? colors.primary : colors.ink700};
  }

  svg { flex-shrink: 0; }
`;

const Badge = styled.span`
  margin-left: auto;
  font-size: 12px;
  font-weight: 800;
  border-radius: ${radius.pill};
  padding: 2px 8px;
  background: ${colors.primary};
  color: #fff;
  font-variant-numeric: tabular-nums;
`;

const ProfileCard = styled.div`
  background: ${colors.surface2};
  border-radius: ${radius.sm};
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
`;

const LogoutButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: ${radius.sm};
  background: none;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  color: ${colors.ink400};
  &:hover { background: ${colors.border}; color: ${colors.danger}; }
`;

// ── Icons (inline SVG to avoid dependency) ──────────────────────────

function Icon({ name }: { name: string }) {
  const icons: Record<string, React.ReactNode> = {
    queue: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
        <line x1="8" y1="18" x2="21" y2="18"/>
        <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
      </svg>
    ),
    overview: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
    tv: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/>
        <line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    ),
    history: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/>
        <polyline points="12 7 12 12 15 15"/>
      </svg>
    ),
    logout: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
        <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
      </svg>
    ),
    shield: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  };
  return <>{icons[name] ?? null}</>;
}

// ── Component ────────────────────────────────────────────────────────

export function AdminSidebar({
  queueLength,
}: {
  queueLength?: number;
}) {
  const { session, clearSession } = useAdminStore();
  const pathname = usePathname();
  const isAdmin  = session?.role === 'admin' || session?.role === 'superadmin';

  return (
    <Sidebar aria-label="Admin navigation">
      <Logo>
        <LogoMark><Icon name="shield" /></LogoMark>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: colors.ink, lineHeight: 1 }}>SwasthLink</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: colors.ink500 }}>Queue Console</div>
        </div>
      </Logo>

      <NavGroup>
        {session?.role === 'doctor' && (
          <NavItem href="/admin/dashboard" active={pathname === '/admin/dashboard'} aria-current={pathname === '/admin/dashboard' ? 'page' : undefined}>
            <Icon name="queue" />
            Live Queue
            {queueLength != null && queueLength > 0 && <Badge>{queueLength}</Badge>}
          </NavItem>
        )}
        {isAdmin && (
          <NavItem href="/admin/overview" active={pathname === '/admin/overview'} aria-current={pathname === '/admin/overview' ? 'page' : undefined}>
            <Icon name="overview" />
            All Queues
          </NavItem>
        )}
        <NavItem href="/admin/tv" active={pathname === '/admin/tv'} aria-current={pathname === '/admin/tv' ? 'page' : undefined}>
          <Icon name="tv" />
          TV Display
        </NavItem>
        <NavItem href="/admin/history" active={pathname === '/admin/history'} aria-current={pathname === '/admin/history' ? 'page' : undefined}>
          <Icon name="history" />
          History
        </NavItem>
      </NavGroup>

      {session && (
        <ProfileCard>
          <Avatar name={session.name} size={36} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: colors.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {session.name}
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: colors.ink500 }}>
              {session.role === 'doctor'
                ? `${session.room ?? ''} · ${session.departmentName ?? ''}`
                : `${session.hospitalName} · Admin`}
            </div>
          </div>
          <LogoutButton onClick={clearSession} aria-label="Sign out" title="Sign out">
            <Icon name="logout" />
          </LogoutButton>
        </ProfileCard>
      )}
    </Sidebar>
  );
}

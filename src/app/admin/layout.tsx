'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import styled from '@emotion/styled';
import { colors } from '@/theme';
import { useAdminStore } from '@/store/adminStore';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminMobileNav } from '@/components/admin/AdminMobileNav';

const Shell = styled.div`
  display: flex;
  min-height: 100dvh;
  background: ${colors.bg};
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
`;

const Content = styled.main`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    padding-bottom: 64px;
  }
`;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const { session, queueState } = useAdminStore();

  // Wait for the client to mount so Zustand can hydrate session from localStorage.
  // Without this, the server render sees session=null and the redirect fires before
  // the persisted session is loaded, causing a spurious logout on every page reload.
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const isLoginPage = pathname === '/admin/login';

  // Auth guard — only runs after client mount
  useEffect(() => {
    if (!mounted) return;
    if (!isLoginPage && !session) {
      router.replace('/admin/login');
    }
  }, [mounted, session, isLoginPage, router]);

  // Role guard — only runs after client mount
  useEffect(() => {
    if (!mounted || !session || isLoginPage) return;
    const isAdmin  = session.role === 'admin' || session.role === 'superadmin';
    const isDoctor = session.role === 'doctor';
    if (pathname === '/admin/dashboard' && isAdmin)  router.replace('/admin/overview');
    if (pathname === '/admin/overview'  && isDoctor) router.replace('/admin/dashboard');
  }, [mounted, session, pathname, router, isLoginPage]);

  // Render nothing while hydrating (avoids flash of wrong content / spurious redirect)
  if (!mounted && !isLoginPage) return null;

  // After mount, if no session the redirect is in flight — keep showing nothing
  if (mounted && !isLoginPage && !session) return null;

  // Login page has no shell
  if (isLoginPage) return <>{children}</>;

  const queueLength = queueState?.upcoming?.length;

  return (
    <Shell>
      <AdminSidebar queueLength={queueLength} />
      <Content>{children}</Content>
      <AdminMobileNav queueLength={queueLength} />
    </Shell>
  );
}

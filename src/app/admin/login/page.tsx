'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styled from '@emotion/styled';
import { colors, radius, shadows } from '@/theme';
import { loginStaff } from '@/services/staffService';
import { useAdminStore } from '@/store/adminStore';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

// ── Styled ───────────────────────────────────────────────────────────

const Page = styled.div`
  min-height: 100dvh;
  display: flex;
  background: ${colors.bg};
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
`;

const BrandPanel = styled.div`
  width: 44%;
  min-height: 100%;
  background: linear-gradient(160deg, ${colors.primary}, ${colors.primaryDark});
  color: #fff;
  padding: 48px 44px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  @media (max-width: 768px) { display: none; }
`;

const FormPanel = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
`;

const FormCard = styled.div`
  width: 100%;
  max-width: 360px;
`;

const FieldWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 13px;
  font-weight: 700;
  color: ${colors.ink700};
`;

const Input = styled.input`
  width: 100%;
  height: 48px;
  border: 1.5px solid ${colors.border};
  border-radius: ${radius.sm};
  padding: 0 14px;
  font-size: 15px;
  font-family: inherit;
  font-weight: 500;
  color: ${colors.ink};
  background: ${colors.surface};
  outline: none;
  transition: border-color 0.15s;

  &:focus { border-color: ${colors.primary}; }
  &::placeholder { color: ${colors.ink400}; }
`;

const DemoHint = styled.div`
  background: ${colors.primary50};
  border: 1px solid ${colors.primary100};
  border-radius: ${radius.sm};
  padding: 10px 14px;
  font-size: 12.5px;
  font-weight: 600;
  color: ${colors.primary};
  line-height: 1.5;
`;

// ── Stat block (brand panel) ─────────────────────────────────────────

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 24, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>{label}</div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────

export default function AdminLoginPage() {
  const router    = useRouter();
  const setSession = useAdminStore((s) => s.setSession);

  const [staffId,   setStaffId]   = useState('');
  const [password,  setPassword]  = useState('');
  const [error,     setError]     = useState('');
  const [loading,   setLoading]   = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffId.trim() || !password) { setError('Please enter your staff ID and password.'); return; }

    setLoading(true);
    setError('');

    try {
      const result = await loginStaff(staffId.trim().toLowerCase(), password);
      if (result.error || !result.session) {
        setError(result.error ?? 'Login failed. Try again.');
        return;
      }
      setSession(result.session);
      const role = result.session.role;
      router.replace(role === 'doctor' ? '/admin/dashboard' : '/admin/overview');
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page>
      {/* ── Brand panel ──────────────────────────────────────────── */}
      <BrandPanel>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: radius.sm,
            background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>SwasthLink</div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>Queue Operations Console</div>
          </div>
        </div>

        <div>
          <div style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.01em' }}>
            Run your OPD<br />queue with calm.
          </div>
          <div style={{ fontSize: 15, fontWeight: 500, color: 'rgba(255,255,255,0.8)', marginTop: 14, lineHeight: 1.6, maxWidth: 320 }}>
            Call the next patient, manage flow, and keep the waiting area informed — all in real time.
          </div>
        </div>

        <div style={{ display: 'flex', gap: 28 }}>
          <Stat label="Avg consult" value="4 min" />
          <Stat label="Multi-hospital" value="✓" />
          <Stat label="Realtime" value="✓" />
        </div>
      </BrandPanel>

      {/* ── Form panel ───────────────────────────────────────────── */}
      <FormPanel>
        <FormCard>
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: colors.ink, margin: '0 0 4px' }}>Sign in</h1>
            <p style={{ fontSize: 14, fontWeight: 600, color: colors.ink500, margin: 0 }}>
              Doctor &amp; admin access
            </p>
          </div>

          {/* Demo hint */}
          <DemoHint style={{ marginBottom: 20 }}>
            <strong>Demo credentials:</strong><br />
            Doctor: <code>dr.sharma</code> / <code>password</code><br />
            Admin: <code>admin</code> / <code>admin123</code>
          </DemoHint>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <FieldWrap>
              <Label htmlFor="staffId">Staff ID</Label>
              <Input
                id="staffId"
                type="text"
                autoComplete="username"
                placeholder="e.g. dr.sharma"
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                autoFocus
                aria-required
              />
            </FieldWrap>

            <FieldWrap>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-required
              />
            </FieldWrap>

            {error && <Alert variant="danger">{error}</Alert>}

            <Button
              type="submit"
              full
              size="lg"
              disabled={loading}
              aria-label="Sign in to Queue Console"
            >
              {loading ? 'Signing in…' : 'Sign in to Console →'}
            </Button>

            <p style={{ textAlign: 'center', fontSize: 12.5, color: colors.ink500, fontWeight: 600, margin: 0 }}>
              Trouble signing in? Contact IT helpdesk · ext. 204
            </p>
          </form>
        </FormCard>
      </FormPanel>
    </Page>
  );
}

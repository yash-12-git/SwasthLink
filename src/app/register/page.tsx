'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, ArrowRight } from 'lucide-react';
import { MobileLayout }    from '@/components/layout/MobileLayout';
import { BackBar }         from '@/components/layout/BackBar';
import { BottomNav }       from '@/components/layout/BottomNav';
import { TextField }       from '@/components/ui/Field';
import { Button }          from '@/components/ui/Button';
import { colors }          from '@/theme';
import { usePatientStore } from '@/store/patientStore';

export default function RegisterPage() {
  const router          = useRouter();
  const account         = usePatientStore((s) => s.account);
  const setAccount      = usePatientStore((s) => s.setAccount);
  const setFamilyMembers = usePatientStore((s) => s.setFamilyMembers);
  const clearAccount    = usePatientStore((s) => s.clearAccount);

  const [mobile, setMobile]   = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  // Already logged in — skip straight to family selection
  useEffect(() => {
    if (account.id) router.replace('/family');
  }, [account.id, router]);

  if (account.id) return null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(mobile)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    try {
      const { findOrCreateAccount, getPatientsByAccount } = await import('@/services/accountService');
      const acc     = await findOrCreateAccount(mobile);
      const members = await getPatientsByAccount(acc.id);
      setAccount(acc);
      setFamilyMembers(members);
      router.push('/family');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileLayout>
      <BackBar title="Enter Mobile Number" subtitle="Step 1 of 3" href="/" />

      <form onSubmit={onSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column' }} noValidate>
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 16px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <p style={{ fontSize: 14, color: colors.ink500, fontWeight: 600, lineHeight: 1.5, margin: 0 }}>
            One mobile number covers your whole family. You can add multiple patients — husband, wife, children, parents — under a single number.
          </p>

          <TextField
            label="Mobile Number"
            placeholder="9876543210"
            icon={<Phone size={20} />}
            inputMode="numeric"
            hint="10-digit Indian mobile number"
            error={error}
            value={mobile}
            onChange={(v) => { setMobile(v.replace(/\D/g, '').slice(0, 10)); setError(''); }}
            autoFocus
          />
        </div>

        <div style={{ padding: '12px 16px', borderTop: `1px solid ${colors.border}`, background: colors.surface, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Button type="submit" full size="lg" disabled={loading || mobile.length !== 10}>
            {loading ? 'Please wait…' : <>Continue <ArrowRight size={20} /></>}
          </Button>
          <button
            type="button"
            onClick={clearAccount}
            style={{ background: 'none', border: 'none', color: colors.ink400, fontSize: 13, cursor: 'pointer', padding: '4px 0' }}
          >
            Different number? Start over
          </button>
        </div>
      </form>

      <BottomNav />
    </MobileLayout>
  );
}

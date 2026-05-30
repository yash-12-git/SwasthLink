'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminStore } from '@/store/adminStore';

export default function AdminRootPage() {
  const router  = useRouter();
  const session = useAdminStore((s) => s.session);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!session) {
      router.replace('/admin/login');
    } else if (session.role === 'doctor') {
      router.replace('/admin/dashboard');
    } else {
      router.replace('/admin/overview');
    }
  }, [mounted, session, router]);

  return null;
}

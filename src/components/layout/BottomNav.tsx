'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, Ticket, HelpCircle } from 'lucide-react';
import { colors, shadows } from '@/theme';
import { useTranslation } from '@/hooks/useTranslation';
import { usePatientStore } from '@/store/patientStore';

const NAV_ITEMS = [
  { id: 'home',    icon: Building2,   href: '/',      labelKey: 'nav.home'    },
  { id: 'queue',   icon: Ticket,      href: '/track', labelKey: 'nav.myQueue' },
  { id: 'help',    icon: HelpCircle,  href: '/help',  labelKey: 'nav.help'    },
] as const;

export function BottomNav() {
  const pathname     = usePathname();
  const { t }        = useTranslation();
  const activeEntry  = usePatientStore((s) => s.activeEntry);

  return (
    <div
      style={{
        display:    'flex',
        background: colors.surface,
        borderTop:  `1px solid ${colors.border}`,
        padding:    '8px 8px env(safe-area-inset-bottom, 6px)',
        boxShadow:  shadows.up,
        flexShrink: 0,
      }}
    >
      {NAV_ITEMS.map(({ id, icon: Icon, href, labelKey }) => {
        const active = pathname === href || (href !== '/' && pathname.startsWith(href));
        return (
          <Link
            key={id}
            href={href}
            style={{
              flex:           1,
              display:        'flex',
              flexDirection:  'column',
              alignItems:     'center',
              gap:            3,
              padding:        '6px 0',
              textDecoration: 'none',
              position:       'relative',
            }}
          >
            <div style={{ position: 'relative' }}>
              <Icon size={23} color={active ? colors.primary : colors.ink400} strokeWidth={active ? 2.4 : 2} />
              {id === 'queue' && activeEntry && (
                <span style={{ position: 'absolute', top: -2, right: -4, width: 8, height: 8, borderRadius: '50%', background: colors.success, border: '1.5px solid #fff' }} />
              )}
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: active ? colors.primary : colors.ink400 }}>
              {t(labelKey)}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

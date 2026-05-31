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
  const hospital      = usePatientStore((s) => s.hospital);
  const allEntries    = usePatientStore((s) => s.activeEntries);
  const hasAnyActive  = Object.keys(allEntries[hospital.id ?? ''] ?? {}).length > 0;

  return (
    <nav
      aria-label="Main navigation"
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
        const label  = t(labelKey);
        return (
          <Link
            key={id}
            href={href}
            aria-label={id === 'queue' && hasAnyActive ? `${label} (active token)` : label}
            aria-current={active ? 'page' : undefined}
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
              {id === 'queue' && hasAnyActive && (
                <span aria-hidden="true" style={{ position: 'absolute', top: -2, right: -4, width: 8, height: 8, borderRadius: '50%', background: colors.success, border: '1.5px solid #fff' }} />
              )}
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: active ? colors.primary : colors.ink400 }}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

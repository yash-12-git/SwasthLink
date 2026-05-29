'use client';

import React from 'react';
import { Phone, MapPin, QrCode, Info, ChevronRight, Users } from 'lucide-react';
import { MobileLayout }  from '@/components/layout/MobileLayout';
import { BackBar }       from '@/components/layout/BackBar';
import { BottomNav }     from '@/components/layout/BottomNav';
import { Card }          from '@/components/ui/Card';
import { colors, radius } from '@/theme';
import { useTranslation } from '@/hooks/useTranslation';

const HELPDESK = process.env.NEXT_PUBLIC_HELPDESK_PHONE ?? '1800-180-1104';

const HELP_ITEMS = [
  { icon: Phone,  colorKey: 'success', titleKey: 'help.callDesk', subKey: 'help.callDeskSub', phone: true },
  { icon: MapPin, colorKey: 'primary', titleKey: 'help.findOpd',  subKey: 'help.findOpdSub',  phone: false },
  { icon: QrCode, colorKey: 'purple',  titleKey: 'help.rescan',   subKey: 'help.rescanSub',   phone: false },
  { icon: Info,   colorKey: 'warning', titleKey: 'help.howItWorks',subKey: 'help.howItWorksSub',phone: false },
] as const;

const COLOR_MAP: Record<string, { color: string; bg: string }> = {
  success: { color: colors.success, bg: colors.success50 },
  primary: { color: colors.primary, bg: colors.primary50 },
  purple:  { color: '#6A3FB8',      bg: '#EFE8FA'        },
  warning: { color: colors.warning, bg: colors.warning50 },
};

export default function HelpPage() {
  const { t } = useTranslation();

  return (
    <MobileLayout>
      <BackBar title={t('help.title')} href="/" />

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {HELP_ITEMS.map(({ icon: Icon, colorKey, titleKey, subKey, phone }) => {
          const c = COLOR_MAP[colorKey];
          return (
            <Card key={titleKey} hover pad="14px" style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
              <div style={{ width: 48, height: 48, borderRadius: radius.md, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={24} color={c.color} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15.5, fontWeight: 800, color: colors.ink }}>{t(titleKey)}</div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: colors.ink500 }}>
                  {phone ? t(subKey, { phone: HELPDESK }) : t(subKey)}
                </div>
              </div>
              <ChevronRight size={20} color={colors.ink400} />
            </Card>
          );
        })}

        {/* Staff note */}
        <Card pad="16px" style={{ background: colors.primary50, border: `1px solid ${colors.primary100}`, textAlign: 'center', marginTop: 4 }}>
          <Users size={32} color={colors.primary} style={{ margin: '0 auto 8px', display: 'block' }} />
          <div style={{ fontSize: 14, fontWeight: 700, color: colors.primaryDark, lineHeight: 1.4 }}>
            {t('help.staffNote')}
          </div>
        </Card>
      </div>

      <BottomNav />
    </MobileLayout>
  );
}

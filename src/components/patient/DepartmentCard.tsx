'use client';

import React from 'react';
import { ChevronRight, Users, Clock } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';
import { colors, radius } from '@/theme';
import { useTranslation } from '@/hooks/useTranslation';
import type { Department } from '@/types/department';

interface DepartmentCardProps {
  dept:    Department;
  onClick: () => void;
}

export function DepartmentCard({ dept, onClick }: DepartmentCardProps) {
  const { t } = useTranslation();

  return (
    <Card
      hover
      accent={dept.color}
      pad="14px"
      onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: 14 }}
    >
      {/* Icon bubble */}
      <div
        style={{
          width: 52, height: 52, borderRadius: radius.md,
          background: dept.bg, color: dept.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}
      >
        <Users size={26} color={dept.color} />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: colors.ink, lineHeight: 1.1 }}>{dept.name}</div>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: colors.ink500, marginBottom: 6 }}>{dept.nameHi}</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {dept.activeQueue != null && (
            <Pill>
              <Users size={13} /> {dept.activeQueue} {t('department.inQueue')}
            </Pill>
          )}
          {dept.avgWaitMins != null && (
            <Pill bg={colors.warning50} color={colors.warning}>
              <Clock size={13} /> {t('department.wait', { mins: dept.avgWaitMins })}
            </Pill>
          )}
        </div>
      </div>

      <ChevronRight size={22} color={colors.ink400} />
    </Card>
  );
}

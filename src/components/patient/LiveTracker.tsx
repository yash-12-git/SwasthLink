'use client';

import React, { useEffect, useReducer } from 'react';
import { Phone } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Pill } from '@/components/ui/Pill';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { Button } from '@/components/ui/Button';
import { colors, radius } from '@/theme';
import { useQueueStore } from '@/store/queueStore';
import { useRealtimeQueue } from '@/hooks/useQueue';
import { useTranslation } from '@/hooks/useTranslation';
import { secsSince } from '@/utils/format';

export function LiveTracker() {
  const live    = useQueueStore((s) => s.live);
  const ahead   = useQueueStore((s) => s.patientsAhead());
  const wait    = useQueueStore((s) => s.estimatedWait());
  const progress= useQueueStore((s) => s.progressPct());
  const { t }   = useTranslation();

  // Tick every second to update "last call Xs ago"
  const [, tick] = useReducer((x: number) => x + 1, 0);
  useEffect(() => { const id = setInterval(tick, 1000); return () => clearInterval(id); }, []);

  // Realtime subscription
  useRealtimeQueue(live?.queueId);

  if (!live) return null;

  const paused   = live.doctorStatus === 'paused';
  const isYou    = live.currentToken >= live.yourToken;
  const isNear   = ahead <= 2 && ahead > 0;
  const sinceCall = secsSince(live.lastCallAt);

  const heroColor = isYou
    ? `linear-gradient(160deg, ${colors.success}, #1B5E20)`
    : `linear-gradient(160deg, ${colors.primary}, ${colors.primaryDark})`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <div style={{ background: heroColor, borderRadius: radius.lg, padding: '22px 20px', color: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,.12)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          {/* Your token */}
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: 'rgba(255,255,255,.72)', textTransform: 'uppercase', letterSpacing: '.07em' }}>
              {t('track.yourToken')}
            </div>
            <div style={{ fontSize: 45, fontWeight: 800, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
              {live.yourTokenLabel}
            </div>
          </div>
          {/* Now serving */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: 'rgba(255,255,255,.72)' }}>
              {t('track.nowServing')}
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 7, justifyContent: 'flex-end', fontVariantNumeric: 'tabular-nums' }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#fff', animation: 'ht-pulse 1.4s infinite', flexShrink: 0 }} />
              {live.currentTokenLabel}
            </div>
          </div>
        </div>

        {/* Status box */}
        <div style={{ marginTop: 18, background: 'rgba(255,255,255,.14)', borderRadius: radius.sm, padding: '14px 16px', textAlign: 'center' }}>
          {isYou ? (
            <div style={{ fontSize: 19, fontWeight: 800 }}>
              {t('track.itsYourTurn', { room: live.room })}
            </div>
          ) : (
            <>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,.85)' }}>
                {isNear ? t('track.almostYourTurn') : t('track.relax')}
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>
                {ahead} <span style={{ fontSize: 16, fontWeight: 700, opacity: 0.8 }}>{t('track.patientsAhead', { n: '' }).replace('{{n}} ', '')}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Progress ──────────────────────────────────────────────── */}
      <Card pad="16px">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: colors.ink }}>{t('track.queueProgress')}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: colors.primary, fontVariantNumeric: 'tabular-nums' }}>
            {Math.round(progress)}%
          </div>
        </div>
        <ProgressBar value={progress} color={isYou ? colors.success : colors.primary} height={12} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: colors.ink500 }}>{live.currentTokenLabel} now</span>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: colors.ink500 }}>{live.yourTokenLabel} you</span>
        </div>
      </Card>

      {/* ── Wait + doctor status ──────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 12 }}>
        <Card pad="16px" style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: colors.ink500, textTransform: 'uppercase', letterSpacing: '.06em' }}>{t('track.estWait')}</div>
          <div style={{ fontSize: 40, fontWeight: 800, color: colors.warning, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>
            {wait}<span style={{ fontSize: 18 }}>m</span>
          </div>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: colors.ink500 }}>
            {t('track.perPatient', { mins: live.avgMinsPerPatient })}
          </div>
        </Card>
        <Card pad="16px" style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: colors.ink500, textTransform: 'uppercase', letterSpacing: '.06em' }}>{t('track.doctor')}</div>
          <div style={{ margin: '8px 0 6px', display: 'flex', justifyContent: 'center' }}>
            <StatusBadge status={paused ? 'paused' : 'available'} pulse={!paused} />
          </div>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: colors.ink500 }}>
            {paused ? t('track.consultResumes') : t('track.lastCall', { secs: sinceCall })}
          </div>
        </Card>
      </div>

      {/* ── Upcoming list ────────────────────────────────────────── */}
      <div>
        <SectionLabel>{t('track.upcomingTokens')}</SectionLabel>
        <Card pad="6px">
          {live.upcomingTokens.slice(0, 6).map((tok, i) => (
            <div
              key={tok.token}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px',
                borderRadius: radius.sm,
                background: tok.isYou ? colors.primary50 : 'transparent',
                border: `1.5px solid ${tok.isYou ? colors.primary100 : 'transparent'}`,
                marginBottom: i < 5 ? 2 : 0,
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 800, color: tok.isYou ? colors.primary : colors.ink, width: 54, fontVariantNumeric: 'tabular-nums' }}>
                {tok.label}
              </div>
              <div style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: colors.ink700 }}>
                {tok.isYou ? 'You' : `Patient`}
              </div>
              {i === 0 ? (
                <Pill bg={colors.warning50} color={colors.warning}>{t('track.tokenNext')}</Pill>
              ) : tok.isYou ? (
                <Pill bg={colors.primary50} color={colors.primary}>{t('track.yourTurnLabel')}</Pill>
              ) : (
                <span style={{ fontSize: 12, fontWeight: 700, color: colors.ink400 }}>#{i + 1}</span>
              )}
            </div>
          ))}
        </Card>
      </div>

      <Link href="/help" style={{ textDecoration: 'none' }}>
        <Button full size="md" variant="ghost">
          <Phone size={17} /> {t('track.getHelp')}
        </Button>
      </Link>
    </div>
  );
}

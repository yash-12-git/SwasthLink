export function fmtToken(prefix: string, n: number): string {
  return `${prefix}-${String(n).padStart(3, '0')}`;
}

export function fmtWait(mins: number): string {
  if (mins <= 0) return '< 1 min';
  if (mins < 60) return `~${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function secsSince(ts: number): number {
  return Math.floor((Date.now() - ts) / 1000);
}

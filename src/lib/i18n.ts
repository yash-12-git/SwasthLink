import en from '@/locales/en';
import hi from '@/locales/hi';

export const locales = { en, hi } as const;
export type Locale = keyof typeof locales;
export const defaultLocale: Locale = 'en';
export const supportedLocales: Locale[] = ['en', 'hi'];

/**
 * Simple template interpolation — replaces {{key}} with values.
 * e.g. t('track.patientsAhead', { n: 5 }) → "5 patients ahead"
 */
export function interpolate(str: string, vars?: Record<string, string | number>): string {
  if (!vars) return str;
  return str.replace(/\{\{(\w+)\}\}/g, (_, key) =>
    vars[key] !== undefined ? String(vars[key]) : `{{${key}}}`
  );
}

export type TranslationRecord = typeof en;

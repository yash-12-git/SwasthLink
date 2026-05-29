'use client';

import { usePatientStore } from '@/store/patientStore';
import { locales, interpolate } from '@/lib/i18n';

type Vars = Record<string, string | number>;

export function useTranslation() {
  const locale = usePatientStore((s) => s.locale);
  const dict   = locales[locale] ?? locales.en;

  /** t('register.title') or t('track.patientsAhead', { n: 5 }) */
  function t(path: string, vars?: Vars): string {
    const keys  = path.split('.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let val: any = dict;
    for (const k of keys) {
      val = val?.[k];
      if (val === undefined) break;
    }
    const str = typeof val === 'string' ? val : path;
    return interpolate(str, vars);
  }

  return { t, locale };
}

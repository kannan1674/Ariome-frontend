import type { Locale } from './locales';
import { LOCALE_LABELS } from './locales';

type TranslateParams = Record<string, string | number>;

export function interpolate(template: string, params?: TranslateParams) {
  if (!params) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const val = params[key];
    return val !== undefined ? String(val) : `{{${key}}}`;
  });
}

export function t(
  messages: Record<string, unknown>,
  path: string,
  params?: TranslateParams,
): string {
  const parts = path.split('.');
  let cur: unknown = messages;
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in cur) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return path;
    }
  }
  if (typeof cur !== 'string') return path;
  return interpolate(cur, params);
}

export function localeDisplayName(locale: Locale) {
  return LOCALE_LABELS[locale];
}

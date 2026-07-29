export const SUPPORTED_LOCALES = ['en', 'es', 'fr', 'hi', 'ta'] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_COOKIE = 'ariome_locale';

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  hi: 'हिन्दी',
  ta: 'தமிழ்',
};

export function isLocale(value: string | null | undefined): value is Locale {
  return !!value && SUPPORTED_LOCALES.includes(value as Locale);
}

export function normalizeLocale(value: string | null | undefined): Locale {
  if (!value) return DEFAULT_LOCALE;
  const base = value.split('-')[0].toLowerCase();
  return isLocale(base) ? base : DEFAULT_LOCALE;
}

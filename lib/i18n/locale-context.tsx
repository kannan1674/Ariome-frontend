'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { getMessages, type Messages } from './messages';
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALE_LABELS,
  type Locale,
  normalizeLocale,
} from './locales';
import { t as translate } from './translate';
import {
  canUseLocalStorage,
  getLocalStorageItem,
  setLocalStorageItem,
} from '@/lib/utils/safeStorage';

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  messages: Messages;
  t: (key: string, params?: Record<string, string | number>) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function readStoredLocale(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  try {
    const cookie = document.cookie
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${LOCALE_COOKIE}=`));
    if (cookie) {
      return normalizeLocale(decodeURIComponent(cookie.split('=')[1] ?? ''));
    }
    const stored = getLocalStorageItem(LOCALE_COOKIE);
    if (stored) return normalizeLocale(stored);
    if (navigator.language) return normalizeLocale(navigator.language);
  } catch {
    /* ignore */
  }
  return DEFAULT_LOCALE;
}

function persistLocale(locale: Locale) {
  if (!canUseLocalStorage()) return;
  setLocalStorageItem(LOCALE_COOKIE, locale);
  document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=31536000;SameSite=Lax`;
  document.documentElement.lang = locale;
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLocaleState(readStoredLocale());
    setReady(true);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    persistLocale(next);
  }, []);

  const messages = useMemo(() => getMessages(locale), [locale]);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      messages,
      t: (key, params) => translate(messages, key, params),
    }),
    [locale, setLocale, messages],
  );

  if (!ready) {
    return (
      <LocaleContext.Provider
        value={{
          locale: DEFAULT_LOCALE,
          setLocale,
          messages: getMessages(DEFAULT_LOCALE),
          t: (key, params) => translate(getMessages(DEFAULT_LOCALE), key, params),
        }}
      >
        {children}
      </LocaleContext.Provider>
    );
  }

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}

export function useTranslations() {
  const { t, locale, messages } = useLocale();
  return { t, locale, messages, localeLabel: LOCALE_LABELS[locale] };
}

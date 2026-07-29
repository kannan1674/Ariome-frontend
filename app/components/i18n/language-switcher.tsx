'use client';

import { cn } from '@/lib/utils';
import { useLocale, useTranslations } from '@/lib/i18n/locale-context';
import { LOCALE_LABELS, SUPPORTED_LOCALES } from '@/lib/i18n/locales';
import type { Locale } from '@/lib/i18n/locales';
import { Globe } from 'lucide-react';

type Props = {
  className?: string;
  compact?: boolean;
};

export default function LanguageSwitcher({ className, compact }: Props) {
  const { locale, setLocale } = useLocale();
  const { t } = useTranslations();

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {!compact && (
        <span className="hidden items-center gap-1 text-xs font-medium text-gray-600 sm:inline-flex">
          <Globe className="size-3.5" aria-hidden />
          {t('language.label')}
        </span>
      )}
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        aria-label={t('language.change')}
        className={cn(
          'rounded-full border border-[var(--ariome-border-strong)] bg-[var(--ariome-surface)] py-1.5 text-xs font-semibold text-[var(--ariome-text)] shadow-sm',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500',
          compact ? 'px-2' : 'px-3',
        )}
      >
        {SUPPORTED_LOCALES.map((loc) => (
          <option key={loc} value={loc}>
            {LOCALE_LABELS[loc]}
          </option>
        ))}
      </select>
    </div>
  );
}

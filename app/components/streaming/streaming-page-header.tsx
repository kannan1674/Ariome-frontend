'use client';

import Link from 'next/link';
import { Settings } from 'lucide-react';
import LanguageSwitcher from '@/app/components/i18n/language-switcher';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type StreamingPageHeaderProps = {
  brand?: string;
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  showLanguage?: boolean;
  showSettings?: boolean;
  center?: boolean;
  trailing?: ReactNode;
  className?: string;
};

export function StreamingPageHeader({
  brand = 'Ariome',
  title,
  subtitle,
  backHref,
  backLabel,
  showLanguage,
  showSettings = true,
  center,
  trailing,
  className,
}: StreamingPageHeaderProps) {
  return (
    <header className={cn('flex items-start justify-between gap-4', className)}>
      {showLanguage ? <LanguageSwitcher className="shrink-0 pt-1" compact /> : <div className="w-10 shrink-0" />}
      <div className={cn('min-w-0 flex-1', center && 'text-center')}>
        {backHref ? (
          <Link
            href={backHref}
            className="mb-3 inline-block text-sm font-medium text-[var(--ariome-gold)] hover:text-[var(--ariome-gold-soft)]"
          >
            {backLabel ?? '← Back'}
          </Link>
        ) : null}
        {brand ? <p className="ariome-label">{brand}</p> : null}
        <h1 className="ariome-display mt-2 text-3xl font-semibold tracking-tight text-[var(--ariome-text)] sm:text-4xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-2 text-sm leading-relaxed text-[var(--ariome-text-muted)]">{subtitle}</p>
        ) : null}
      </div>
      {trailing ??
        (showSettings ? (
          <Link
            href="/profile"
            className="shrink-0 rounded-full p-2.5 text-[var(--ariome-text-faint)] transition hover:bg-[var(--ariome-surface)] hover:text-[var(--ariome-text)]"
            aria-label="Settings"
          >
            <Settings className="size-5" />
          </Link>
        ) : (
          <div className="w-10 shrink-0" />
        ))}
    </header>
  );
}

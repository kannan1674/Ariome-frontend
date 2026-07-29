'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ShowcaseRowProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  emptyMessage?: string;
  isEmpty?: boolean;
  children: ReactNode;
  className?: string;
}

export function ShowcaseRow({
  title,
  subtitle,
  icon,
  emptyMessage,
  isEmpty,
  children,
  className,
}: ShowcaseRowProps) {
  const slug = title.replace(/\s+/g, '-');

  return (
    <section className={cn('space-y-4', className)} aria-labelledby={`row-${slug}`}>
      <div className="flex items-end justify-between gap-4 px-0.5">
        <div className="flex min-w-0 items-center gap-3">
          {icon ? (
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--ariome-gold-muted)] text-[var(--ariome-gold)]">
              {icon}
            </span>
          ) : null}
          <div className="min-w-0">
            <h2
              id={`row-${slug}`}
              className="ariome-display truncate text-xl font-semibold text-[var(--ariome-text)]"
            >
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-0.5 line-clamp-1 text-sm text-[var(--ariome-text-muted)]">{subtitle}</p>
            ) : null}
          </div>
        </div>
      </div>

      {isEmpty && emptyMessage ? (
        <p className="ariome-glass rounded-[var(--ariome-radius-lg)] px-4 py-12 text-center text-sm text-[var(--ariome-text-faint)]">
          {emptyMessage}
        </p>
      ) : (
        <div
          className={cn(
            'flex gap-3 overflow-x-auto pb-2 pt-0.5',
            'snap-x snap-mandatory scroll-smooth ariome-scrollbar-hide',
          )}
        >
          {children}
        </div>
      )}
    </section>
  );
}

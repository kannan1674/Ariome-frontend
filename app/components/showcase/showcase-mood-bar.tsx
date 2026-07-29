'use client';

import { cn } from '@/lib/utils';

interface ShowcaseMoodBarProps {
  moods: readonly string[];
  active: string;
  onSelect: (mood: string) => void;
  labelFor: (mood: string) => string;
  className?: string;
}

export function ShowcaseMoodBar({
  moods,
  active,
  onSelect,
  labelFor,
  className,
}: ShowcaseMoodBarProps) {
  return (
    <div
      className={cn(
        'ariome-glass flex gap-2 overflow-x-auto rounded-full p-1.5',
        'ariome-scrollbar-hide',
        className,
      )}
      role="tablist"
      aria-label="Filter by mood"
    >
      {moods.map((m) => (
        <button
          key={m}
          type="button"
          role="tab"
          aria-selected={active === m}
          onClick={() => onSelect(m)}
          className={cn(
            'shrink-0 rounded-full px-4 py-2 text-xs font-medium transition sm:text-sm',
            active === m
              ? 'ariome-btn-primary shadow-sm'
              : 'text-[var(--ariome-text-muted)] hover:bg-[var(--ariome-surface-hover)] hover:text-[var(--ariome-text)]',
          )}
        >
          {labelFor(m)}
        </button>
      ))}
    </div>
  );
}

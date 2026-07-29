'use client';

import { Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StreamingCard } from '@/app/components/streaming';

export const HOME_MOODS = [
  { id: 'peaceful', label: 'Peaceful', emoji: '🌿' },
  { id: 'grateful', label: 'Grateful', emoji: '💛' },
  { id: 'hopeful', label: 'Hopeful', emoji: '✨' },
  { id: 'joyful', label: 'Joyful', emoji: '😊' },
  { id: 'reflective', label: 'Reflective', emoji: '🌙' },
  { id: 'anxious', label: 'Anxious', emoji: '🫧' },
] as const;

type HomeMoodCheckProps = {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
};

export function HomeMoodCheck({ selectedId, onSelect }: HomeMoodCheckProps) {
  return (
    <StreamingCard accent="gold" className="w-full">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--ariome-gold-muted)] ring-1 ring-[var(--ariome-gold)]/30">
          <Activity className="size-5 text-[var(--ariome-gold)]" strokeWidth={1.65} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold text-[var(--ariome-text)] sm:text-lg">How are you feeling?</h2>
          <p className="mt-1 text-sm text-[var(--ariome-text-muted)]">Tap one mood — we&apos;ll personalize your feed</p>
        </div>
      </div>

      <div
        className="mt-5 flex gap-2 overflow-x-auto pb-1 ariome-scrollbar-hide sm:flex-wrap sm:overflow-visible"
        role="list"
        aria-label="Mood options"
      >
        {HOME_MOODS.map(({ id, label, emoji }) => {
          const selected = selectedId === id;
          return (
            <button
              key={id}
              type="button"
              role="listitem"
              onClick={() => onSelect(selected ? null : id)}
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ariome-gold)]/40',
                selected
                  ? 'border-[var(--ariome-gold)]/60 bg-[var(--ariome-gold-muted)] text-[var(--ariome-gold-soft)]'
                  : 'border-[var(--ariome-border)] bg-[var(--ariome-surface)] text-[var(--ariome-text-muted)] hover:border-[var(--ariome-border-strong)] hover:text-[var(--ariome-text)]',
              )}
            >
              <span aria-hidden>{emoji}</span>
              {label}
            </button>
          );
        })}
      </div>
    </StreamingCard>
  );
}

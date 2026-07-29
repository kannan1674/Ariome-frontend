'use client';

import { Flame, Sparkles } from 'lucide-react';
import { StreamingCard } from '@/app/components/streaming';

export function HomeJourneyStats() {
  return (
    <section aria-label="Your journey">
      <h2 className="ariome-display text-lg font-semibold text-[var(--ariome-text)] sm:text-xl">Your journey</h2>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4">
        <StreamingCard className="flex flex-col items-center py-6 text-center">
          <span className="flex size-11 items-center justify-center rounded-xl bg-violet-100 ring-1 ring-violet-200">
            <Sparkles className="size-5 text-violet-600" strokeWidth={1.5} />
          </span>
          <p className="mt-3 text-2xl font-semibold tabular-nums text-[var(--ariome-text)] sm:text-3xl">0</p>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--ariome-text-faint)]">
            Reflections
          </p>
        </StreamingCard>
        <StreamingCard className="flex flex-col items-center py-6 text-center">
          <span className="flex size-11 items-center justify-center rounded-xl bg-orange-100 ring-1 ring-orange-200">
            <Flame className="size-5 text-orange-600" strokeWidth={1.5} />
          </span>
          <p className="mt-3 text-2xl font-semibold tabular-nums text-[var(--ariome-text)] sm:text-3xl">0</p>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--ariome-text-faint)]">
            Day streak
          </p>
        </StreamingCard>
      </div>
    </section>
  );
}

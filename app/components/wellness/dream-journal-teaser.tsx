'use client';

import { Button } from '@/components/ui/button';
import { getDreamEntries } from '@/lib/wellness/dreamJournal';
import { BookOpen, Moon, Plus } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function DreamJournalTeaser() {
  const [count, setCount] = useState(0);
  const [latest, setLatest] = useState<ReturnType<typeof getDreamEntries>[0] | null>(null);

  useEffect(() => {
    const entries = getDreamEntries();
    setCount(entries.length);
    setLatest(entries[0] ?? null);
  }, []);

  return (
    <div className="rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/70 to-[var(--ariome-surface)] p-5 shadow-sm dark:border-indigo-400/25 dark:from-indigo-950/45 dark:to-[var(--ariome-surface)]">
      <div className="flex items-center gap-2">
        <Moon className="size-5 text-indigo-600 dark:text-indigo-300" aria-hidden />
        <h3 className="text-base font-semibold text-[var(--ariome-text)]">Dream journaling</h3>
      </div>
      <p className="mt-1 text-sm text-[var(--ariome-text-muted)]">
        Capture dreams and sleep quality — feeds into your AI sleep recommendations.
      </p>

      {latest ? (
        <div className="mt-4 rounded-xl border border-indigo-200/70 bg-[var(--ariome-surface)]/90 p-3 dark:border-indigo-400/20">
          <p className="text-xs font-medium text-indigo-800 dark:text-indigo-200">Latest entry</p>
          <p className="mt-1 text-sm font-semibold text-[var(--ariome-text)]">
            {latest.title || 'Dream entry'}
          </p>
          <p className="mt-1 line-clamp-2 text-xs text-[var(--ariome-text-muted)]">{latest.body}</p>
          <p className="mt-2 text-[10px] text-[var(--ariome-text-faint)]">
            {latest.mood} · Sleep: {latest.sleepQuality}
          </p>
        </div>
      ) : (
        <p className="mt-4 text-sm text-[var(--ariome-text-muted)]">No dreams logged yet — start tonight.</p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button asChild size="sm" className="bg-indigo-600 text-white hover:bg-indigo-500">
          <Link href="/journal?tab=dreams">
            <Plus className="mr-1 size-4" />
            Log a dream
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href="/journal?tab=dreams">
            <BookOpen className="mr-1 size-4" />
            Open journal ({count})
          </Link>
        </Button>
      </div>
    </div>
  );
}

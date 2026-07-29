'use client';

import { Button } from '@/components/ui/button';
import { fetchReflectionCard } from '@/lib/content/contentApi';
import type { ReflectionEntry } from '@/lib/content/types';
import { updateReflectionInsight } from '@/lib/journal/reflections';
import { Heart, Loader2, Sparkles } from 'lucide-react';
import { useState } from 'react';

function formatDate(ts: number) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(ts),
  );
}

type Props = {
  entry: ReflectionEntry;
  onInsightSaved?: () => void;
};

export default function EnhancedReflectionCard({ entry, onInsightSaved }: Props) {
  const [loading, setLoading] = useState(false);
  const insight = entry.cardInsight;

  const generateCard = async () => {
    setLoading(true);
    try {
      const card = await fetchReflectionCard(entry.body, entry.moodBefore, entry.moodAfter);
      updateReflectionInsight(entry.id, card);
      onInsightSaved?.();
    } catch {
      window.alert('Could not generate reflection card. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <article className="overflow-hidden rounded-2xl border border-[var(--ariome-border-strong)] bg-[var(--ariome-surface)] shadow-sm ring-1 ring-[var(--ariome-border)]">
      <div className="border-b border-[var(--ariome-border)] bg-gradient-to-r from-teal-50/90 to-[var(--ariome-surface)] px-5 py-4 dark:from-teal-950/50">
        <time
          className="text-xs font-medium text-[var(--ariome-text-muted)]"
          dateTime={new Date(entry.createdAt).toISOString()}
        >
          {formatDate(entry.createdAt)}
        </time>
        <div className="mt-2 flex flex-wrap gap-2 text-[11px] sm:text-xs">
          <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-800 dark:bg-slate-700/70 dark:text-slate-100">
            Before: {entry.moodBefore}
          </span>
          <span className="text-[var(--ariome-text-faint)]">→</span>
          <span className="rounded-full bg-teal-100 px-2 py-0.5 font-medium text-teal-900 dark:bg-teal-500/25 dark:text-teal-100">
            After: {entry.moodAfter}
          </span>
        </div>
      </div>

      <div className="p-5">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--ariome-text)] sm:text-base">
          {entry.body}
        </p>

        {!insight ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="mt-4 border-teal-300 text-teal-800 dark:border-teal-500/40 dark:text-teal-200"
            disabled={loading}
            onClick={() => void generateCard()}
          >
            {loading ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 size-4" />
            )}
            Generate AI reflection card
          </Button>
        ) : (
          <div className="mt-5 space-y-3 border-t border-teal-200/70 pt-4 dark:border-teal-500/25">
            <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-teal-800 dark:text-teal-200">
              <Sparkles className="size-3.5" /> AI reflection card
            </p>
            <div className="rounded-xl bg-teal-50/80 p-3 dark:bg-teal-950/40">
              <p className="text-xs font-medium text-teal-900 dark:text-teal-200">Insight</p>
              <p className="mt-1 text-sm text-[var(--ariome-text)]">{insight.insight}</p>
            </div>
            <div className="rounded-xl bg-amber-50/80 p-3 dark:bg-amber-950/35">
              <p className="text-xs font-medium text-amber-900 dark:text-amber-200">Gratitude</p>
              <p className="mt-1 text-sm text-[var(--ariome-text)]">{insight.gratitude}</p>
            </div>
            <div className="rounded-xl bg-violet-50/80 p-3 dark:bg-violet-950/35">
              <p className="text-xs font-medium text-violet-900 dark:text-violet-200">Gentle challenge</p>
              <p className="mt-1 text-sm text-[var(--ariome-text)]">{insight.gentleChallenge}</p>
            </div>
            <div className="flex gap-2 rounded-xl bg-rose-50/80 p-3 dark:bg-rose-950/35">
              <Heart className="mt-0.5 size-4 shrink-0 text-rose-500 dark:text-rose-300" aria-hidden />
              <p className="text-sm italic text-[var(--ariome-text)]">{insight.affirmation}</p>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

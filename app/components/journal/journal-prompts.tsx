'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { fetchJournalPrompts } from '@/lib/content/contentApi';
import { Lightbulb, Loader2, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

const MOODS = ['Peaceful', 'Grateful', 'Hopeful', 'Reflective', 'Joyful', 'Anxious', 'Sad', 'Content'] as const;

type Props = {
  onSelectPrompt: (prompt: string) => void;
};

export default function JournalPrompts({ onSelectPrompt }: Props) {
  const [mood, setMood] = useState<string>('Reflective');
  const [prompts, setPrompts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchJournalPrompts(mood);
      setPrompts(data.prompts || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load prompts');
    } finally {
      setLoading(false);
    }
  }, [mood]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/80 to-[var(--ariome-surface)] p-5 shadow-sm dark:border-amber-400/25 dark:from-amber-950/40 dark:to-[var(--ariome-surface)]">
      <div className="flex items-center gap-2">
        <Lightbulb className="size-5 text-amber-700 dark:text-amber-300" aria-hidden />
        <h3 className="text-base font-semibold text-[var(--ariome-text)]">Journal prompts</h3>
      </div>
      <p className="mt-1 text-sm text-[var(--ariome-text-muted)]">
        AI prompts to start or deepen your reflection.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <select
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          className="rounded-lg border border-[var(--ariome-border-strong)] bg-[var(--ariome-surface)] px-2 py-1.5 text-sm text-[var(--ariome-text)]"
        >
          {MOODS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <Button type="button" size="sm" variant="outline" disabled={loading} onClick={() => void load()}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
        </Button>
      </div>

      {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}

      <ul className="mt-4 space-y-2">
        {prompts.map((p) => (
          <li key={p}>
            <button
              type="button"
              onClick={() => onSelectPrompt(p)}
              className={cn(
                'w-full rounded-xl border border-amber-200/70 bg-[var(--ariome-surface)] px-3 py-2.5 text-left text-sm text-[var(--ariome-text)]',
                'transition hover:border-amber-400 hover:bg-amber-50/70 dark:border-amber-400/20 dark:hover:bg-amber-950/40',
              )}
            >
              {p}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

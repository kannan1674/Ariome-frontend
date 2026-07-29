'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  DREAM_MOODS,
  SLEEP_QUALITIES,
  deleteDreamEntry,
  getDreamEntries,
  saveDreamEntry,
  type DreamEntry,
  type DreamMood,
  type SleepQuality,
} from '@/lib/wellness/dreamJournal';
import { Check, Moon, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

function formatDreamDate(ts: number) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(ts));
}

function DreamCard({ entry, onDelete }: { entry: DreamEntry; onDelete: (id: string) => void }) {
  return (
    <article className="rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/70 to-[var(--ariome-surface)] p-5 shadow-sm ring-1 ring-indigo-100/60 dark:border-indigo-400/25 dark:from-indigo-950/50 dark:to-[var(--ariome-surface)] dark:ring-indigo-400/15">
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-indigo-100/80 pb-3 dark:border-indigo-400/20">
        <div className="min-w-0">
          {entry.title ? (
            <h3 className="font-serif text-lg font-semibold text-[var(--ariome-text)]">{entry.title}</h3>
          ) : (
            <h3 className="font-serif text-lg font-semibold text-[var(--ariome-text)]">Dream entry</h3>
          )}
          <time
            className="mt-1 block text-xs font-medium text-[var(--ariome-text-muted)]"
            dateTime={new Date(entry.createdAt).toISOString()}
          >
            {formatDreamDate(entry.createdAt)}
          </time>
        </div>
        <button
          type="button"
          onClick={() => onDelete(entry.id)}
          className="rounded-full p-2 text-[var(--ariome-text-faint)] transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-300"
          aria-label="Delete dream entry"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-[11px] sm:text-xs">
        <span className="rounded-full bg-indigo-100 px-2 py-0.5 font-medium text-indigo-900 dark:bg-indigo-500/25 dark:text-indigo-200">
          {entry.mood}
        </span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-800 dark:bg-slate-700/60 dark:text-slate-200">
          Sleep: {entry.sleepQuality}
        </span>
      </div>
      <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-[var(--ariome-text)] sm:text-base">
        {entry.body}
      </p>
    </article>
  );
}

type DreamJournalPanelProps = {
  dialogOpen: boolean;
  onDialogOpenChange: (open: boolean) => void;
};

export default function DreamJournalPanel({ dialogOpen, onDialogOpenChange }: DreamJournalPanelProps) {
  const [entries, setEntries] = useState<DreamEntry[]>([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [mood, setMood] = useState<DreamMood | null>(null);
  const [sleepQuality, setSleepQuality] = useState<SleepQuality | null>(null);

  const load = useCallback(() => {
    setEntries(getDreamEntries());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = useCallback(() => {
    setTitle('');
    setBody('');
    setMood(null);
    setSleepQuality(null);
  }, []);

  const saveDream = useCallback(() => {
    const text = body.trim();
    if (!mood || !sleepQuality) {
      window.alert('Choose how the dream felt and how you slept.');
      return;
    }
    if (!text) {
      window.alert('Describe your dream.');
      return;
    }
    saveDreamEntry({ title, body: text, mood, sleepQuality });
    load();
    onDialogOpenChange(false);
    resetForm();
  }, [body, load, mood, onDialogOpenChange, resetForm, sleepQuality, title]);

  const handleDelete = (id: string) => {
    if (!window.confirm('Delete this dream entry?')) return;
    deleteDreamEntry(id);
    load();
  };

  return (
    <>
      <section aria-label="Dream entries">
        {entries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-indigo-300 bg-indigo-50/60 py-16 text-center dark:border-indigo-400/30 dark:bg-indigo-950/35">
            <Moon className="mx-auto size-10 text-indigo-500 dark:text-indigo-300" aria-hidden />
            <p className="mt-4 text-sm font-semibold text-[var(--ariome-text)] sm:text-base">
              No dreams logged yet.
            </p>
            <p className="mt-2 text-sm text-[var(--ariome-text-muted)]">
              Capture what you remember when you wake up.
            </p>
            <Button
              type="button"
              onClick={() => onDialogOpenChange(true)}
              className="mt-6 rounded-full bg-indigo-600 px-6 font-semibold text-white hover:bg-indigo-500"
            >
              Log a dream
            </Button>
          </div>
        ) : (
          <ul className="grid list-none grid-cols-1 gap-4 pb-6 lg:grid-cols-2 xl:grid-cols-3">
            {entries.map((entry) => (
              <li key={entry.id}>
                <DreamCard entry={entry} onDelete={handleDelete} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          onDialogOpenChange(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent
          showCloseButton={false}
          className={cn(
            'flex max-h-[min(90vh,720px)] w-[calc(100%-1.5rem)] max-w-2xl flex-col gap-0 overflow-hidden border-[var(--ariome-border-strong)] bg-[var(--ariome-surface)] p-0 shadow-xl',
            'left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]',
          )}
        >
          <div className="flex items-center justify-between border-b border-[var(--ariome-border)] px-5 py-4 sm:px-6">
            <h2 className="text-lg font-semibold text-[var(--ariome-text)] sm:text-xl">Log a dream</h2>
            <DialogClose
              className="rounded-full p-2 text-[var(--ariome-text-muted)] transition hover:bg-[var(--ariome-surface-hover)] hover:text-[var(--ariome-text)]"
              aria-label="Close"
            >
              <X className="size-5" />
            </DialogClose>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
            <div className="space-y-2">
              <label htmlFor="dream-title" className="text-sm font-medium text-[var(--ariome-text)]">
                Title (optional)
              </label>
              <Input
                id="dream-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Flying over the ocean"
                className="border-[var(--ariome-border-strong)] bg-[var(--ariome-bg-elevated)] text-[var(--ariome-text)]"
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-[var(--ariome-text)]">How did the dream feel?</p>
              <div className="flex flex-wrap gap-2">
                {DREAM_MOODS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMood(m)}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-xs font-semibold transition sm:text-sm',
                      mood === m
                        ? 'border-indigo-500 bg-indigo-100 text-indigo-900 dark:bg-indigo-500/30 dark:text-indigo-100'
                        : 'border-[var(--ariome-border-strong)] bg-[var(--ariome-bg-elevated)] text-[var(--ariome-text-muted)] hover:text-[var(--ariome-text)]',
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-[var(--ariome-text)]">How did you sleep?</p>
              <div className="flex flex-wrap gap-2">
                {SLEEP_QUALITIES.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setSleepQuality(q)}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-xs font-semibold transition sm:text-sm',
                      sleepQuality === q
                        ? 'border-indigo-500 bg-indigo-100 text-indigo-900 dark:bg-indigo-500/30 dark:text-indigo-100'
                        : 'border-[var(--ariome-border-strong)] bg-[var(--ariome-bg-elevated)] text-[var(--ariome-text-muted)] hover:text-[var(--ariome-text)]',
                    )}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="dream-body" className="text-sm font-medium text-[var(--ariome-text)]">
                What do you remember?
              </label>
              <Textarea
                id="dream-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Images, feelings, symbols, fragments..."
                variant="lg"
                className="min-h-[160px] resize-y border-[var(--ariome-border-strong)] bg-[var(--ariome-bg-elevated)] text-[var(--ariome-text)] placeholder:text-[var(--ariome-text-faint)] focus-visible:bg-[var(--ariome-surface)]"
              />
            </div>
          </div>

          <div className="border-t border-[var(--ariome-border)] p-4 sm:p-5">
            <Button
              type="button"
              onClick={saveDream}
              className="h-12 w-full rounded-xl bg-indigo-600 text-base font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              <Check className="mr-2 size-5" strokeWidth={2.5} aria-hidden />
              Save dream
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

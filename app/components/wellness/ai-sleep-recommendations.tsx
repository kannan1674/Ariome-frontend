'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getDreamEntries, type SleepQuality } from '@/lib/wellness/dreamJournal';
import { fetchSleepRecommendations, type SleepRecommendation } from '@/lib/wellness/sleepAi';
import { Loader2, Sparkles, Sun } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

const STRESS_LEVELS = ['Low', 'Medium', 'High'] as const;
const SLEEP_QUALITIES: SleepQuality[] = ['Restful', 'Okay', 'Restless', 'Poor'];

export default function AiSleepRecommendations() {
  const recentDream = useMemo(() => getDreamEntries()[0] ?? null, []);
  const [sleepQuality, setSleepQuality] = useState<SleepQuality | ''>(
    recentDream?.sleepQuality ?? '',
  );
  const [hoursSlept, setHoursSlept] = useState('7');
  const [stressLevel, setStressLevel] = useState<(typeof STRESS_LEVELS)[number]>('Medium');
  const [goals, setGoals] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SleepRecommendation | null>(null);

  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rec = await fetchSleepRecommendations({
        sleepQuality: sleepQuality || recentDream?.sleepQuality || null,
        hoursSlept: Number(hoursSlept) || null,
        stressLevel,
        dreamMood: recentDream?.mood ?? null,
        recentDreamSnippet: recentDream
          ? `${recentDream.title ? recentDream.title + ': ' : ''}${recentDream.body}`.slice(0, 500)
          : '',
        goals: goals.trim(),
      });
      setResult(rec);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [goals, hoursSlept, recentDream, sleepQuality, stressLevel]);

  return (
    <div className="rounded-2xl border border-violet-200/80 bg-gradient-to-br from-violet-50/90 via-white to-indigo-50/50 p-5 shadow-sm ring-1 ring-violet-100/80">
      <div className="flex items-center gap-2">
        <Sparkles className="size-5 text-violet-600" aria-hidden />
        <h3 className="text-base font-semibold text-gray-900">AI sleep recommendations</h3>
      </div>
      <p className="mt-1 text-sm text-gray-600">
        Personalized tonight plan based on your sleep, stress, and dream journal.
      </p>

      {recentDream && (
        <p className="mt-3 rounded-lg bg-white/80 px-3 py-2 text-xs text-violet-800">
          Using your latest dream ({recentDream.mood}, {recentDream.sleepQuality} sleep).
        </p>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-medium text-gray-700">
          Last night&apos;s sleep
          <select
            value={sleepQuality}
            onChange={(e) => setSleepQuality(e.target.value as SleepQuality | '')}
            className="mt-1 w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
          >
            <option value="">From dream journal</option>
            {SLEEP_QUALITIES.map((q) => (
              <option key={q} value={q}>
                {q}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-medium text-gray-700">
          Hours slept
          <input
            type="number"
            min={0}
            max={14}
            step={0.5}
            value={hoursSlept}
            onChange={(e) => setHoursSlept(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
          />
        </label>
        <label className="text-xs font-medium text-gray-700">
          Stress level
          <select
            value={stressLevel}
            onChange={(e) => setStressLevel(e.target.value as (typeof STRESS_LEVELS)[number])}
            className="mt-1 w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
          >
            {STRESS_LEVELS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-medium text-gray-700 sm:col-span-2">
          Goals (optional)
          <input
            type="text"
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            placeholder="e.g. fall asleep faster, fewer nightmares"
            className="mt-1 w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
          />
        </label>
      </div>

      <Button
        type="button"
        onClick={() => void generate()}
        disabled={loading}
        className="mt-4 w-full bg-violet-600 hover:bg-violet-500"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Generating…
          </>
        ) : (
          <>
            <Sparkles className="mr-2 size-4" />
            Get AI sleep plan
          </>
        )}
      </Button>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {result && (
        <div className="mt-5 space-y-4 border-t border-violet-100 pt-5">
          <p className="text-sm leading-relaxed text-gray-800">{result.summary}</p>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">Tonight</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-gray-700">
              {result.tonightPlan.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Wind-down</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-gray-700">
              {result.windDown.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="flex gap-2 rounded-xl bg-amber-50/80 px-3 py-2">
            <Sun className="size-4 shrink-0 text-amber-600 mt-0.5" aria-hidden />
            <p className="text-sm text-amber-900">{result.morningTip}</p>
          </div>
          <p className="text-[10px] text-gray-400">
            {result.provider === 'openai' ? 'Powered by AI' : 'Personalized tips'}
          </p>
        </div>
      )}
    </div>
  );
}

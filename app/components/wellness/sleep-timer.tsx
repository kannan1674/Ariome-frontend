'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  fadeOutAmbient,
  playAmbientSound,
  stopAmbientSound,
} from '@/lib/wellness/ambientAudio';
import { recordPracticeSession } from '@/lib/wellness/streaks';
import { formatTimer, useCountdown } from '@/lib/wellness/useCountdown';
import { Moon, Pause, Play, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';

const PRESETS = [15, 30, 45, 60, 90];

type SleepSound = 'off' | 'flute' | 'brown';

const SOUND_OPTIONS: { id: SleepSound; label: string }[] = [
  { id: 'flute', label: 'Soft flute' },
  { id: 'brown', label: 'Brown noise' },
  { id: 'off', label: 'Silent' },
];

type Props = { onSessionComplete?: () => void };

export default function SleepTimer({ onSessionComplete }: Props) {
  const [minutes, setMinutes] = useState(30);
  const [sleepSound, setSleepSound] = useState<SleepSound>('flute');
  const totalSec = minutes * 60;
  const { remaining, running, finished, start, pause, reset } = useCountdown(totalSec);

  useEffect(() => {
    reset(minutes * 60);
  }, [minutes, reset]);

  useEffect(() => {
    if (!running || sleepSound === 'off') return;
    const volume = sleepSound === 'flute' ? 0.28 : 0.25;
    playAmbientSound(sleepSound, volume);
    return () => stopAmbientSound();
  }, [running, sleepSound]);

  useEffect(() => {
    if (!finished) return;
    fadeOutAmbient(3000);
    recordPracticeSession();
    onSessionComplete?.();
  }, [finished, onSessionComplete]);

  const progress = totalSec > 0 ? ((totalSec - remaining) / totalSec) * 100 : 0;

  return (
    <div className="rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/50 p-5 shadow-sm ring-1 ring-indigo-100/80">
      <div className="flex items-center gap-2">
        <Moon className="size-5 text-indigo-600" aria-hidden />
        <h3 className="text-base font-semibold text-gray-900">Sleep timer</h3>
      </div>
      <p className="mt-1 text-sm text-gray-600">
        Gentle flute or brown noise fades out when time is up — drift off peacefully.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {PRESETS.map((m) => (
          <button
            key={m}
            type="button"
            disabled={running}
            onClick={() => setMinutes(m)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-semibold transition',
              minutes === m
                ? 'border-indigo-500 bg-indigo-50 text-indigo-800'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50',
              running && 'opacity-50',
            )}
          >
            {m} min
          </button>
        ))}
      </div>

      <fieldset className="mt-4" disabled={running}>
        <legend className="text-sm font-medium text-gray-700">Background sound</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {SOUND_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setSleepSound(opt.id)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-semibold transition',
                sleepSound === opt.id
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-800'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50',
                running && 'pointer-events-none opacity-50',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="relative mx-auto mt-6 flex size-40 items-center justify-center">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100" aria-hidden>
          <circle cx="50" cy="50" r="44" fill="none" stroke="#e0e7ff" strokeWidth="6" />
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="#6366f1"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 44}`}
            strokeDashoffset={`${2 * Math.PI * 44 * (1 - progress / 100)}`}
            className="transition-[stroke-dashoffset] duration-1000 ease-linear"
          />
        </svg>
        <span className="font-serif text-3xl font-semibold tabular-nums text-indigo-950">
          {formatTimer(remaining)}
        </span>
      </div>

      {finished && (
        <p className="mt-4 text-center text-sm font-medium text-indigo-700">Sleep timer ended — sweet dreams.</p>
      )}

      <div className="mt-6 flex justify-center gap-3">
        <Button
          type="button"
          onClick={running ? pause : start}
          className="rounded-full bg-indigo-600 px-6 hover:bg-indigo-500"
        >
          {running ? (
            <>
              <Pause className="mr-2 size-4" /> Pause
            </>
          ) : (
            <>
              <Play className="mr-2 size-4 fill-current" /> Start
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            stopAmbientSound();
            reset(minutes * 60);
          }}
          className="rounded-full"
        >
          <RotateCcw className="mr-2 size-4" /> Reset
        </Button>
      </div>
    </div>
  );
}


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
import { Clock, Pause, Play, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';

const PRESETS = [5, 10, 15, 20];

type Props = { onSessionComplete?: () => void };

type MeditateSound = 'off' | 'mindRelax' | 'zenPad' | 'calmFlow';

const SOUND_OPTIONS: { id: MeditateSound; label: string }[] = [
  { id: 'mindRelax', label: 'Mind relax' },
  { id: 'zenPad', label: 'Zen calm' },
  { id: 'calmFlow', label: 'Calm flow' },
  { id: 'off', label: 'Silent' },
];

export default function MeditationTimer({ onSessionComplete }: Props) {
  const [minutes, setMinutes] = useState(10);
  const [meditateSound, setMeditateSound] = useState<MeditateSound>('mindRelax');
  const totalSec = minutes * 60;
  const { remaining, running, finished, start, pause, reset } = useCountdown(totalSec);

  useEffect(() => {
    reset(minutes * 60);
  }, [minutes, reset]);

  useEffect(() => {
    if (!running || meditateSound === 'off') return;
    playAmbientSound(meditateSound, 0.28);
    return () => stopAmbientSound();
  }, [running, meditateSound]);

  useEffect(() => {
    if (!finished) return;
    fadeOutAmbient(2000);
    recordPracticeSession();
    onSessionComplete?.();
  }, [finished, onSessionComplete]);

  const progress = totalSec > 0 ? ((totalSec - remaining) / totalSec) * 100 : 0;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm ring-1 ring-gray-100/80">
      <div className="flex items-center gap-2">
        <Clock className="size-5 text-teal-600" aria-hidden />
        <h3 className="text-base font-semibold text-gray-900">Meditation timer</h3>
      </div>
      <p className="mt-1 text-sm text-gray-600">
        Settle in with mind relaxing music. When time ends, your streak updates.
      </p>

      <fieldset className="mt-4" disabled={running}>
        <legend className="text-sm font-medium text-gray-700">Background music</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {SOUND_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setMeditateSound(opt.id)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-semibold transition',
                meditateSound === opt.id
                  ? 'border-teal-500 bg-teal-50 text-teal-800'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50',
                running && 'pointer-events-none opacity-50',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </fieldset>

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
                ? 'border-teal-500 bg-teal-50 text-teal-800'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50',
              running && 'opacity-50',
            )}
          >
            {m} min
          </button>
        ))}
      </div>
      <div className="relative mx-auto mt-6 flex size-44 items-center justify-center">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100" aria-hidden>
          <circle cx="50" cy="50" r="44" fill="none" stroke="#e5e7eb" strokeWidth="6" />
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="#0d9488"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 44}`}
            strokeDashoffset={`${2 * Math.PI * 44 * (1 - progress / 100)}`}
            className="transition-[stroke-dashoffset] duration-1000 ease-linear"
          />
        </svg>
        <span className="font-serif text-4xl font-semibold tabular-nums text-gray-900">
          {formatTimer(remaining)}
        </span>
      </div>
      {finished && (
        <p className="mt-4 text-center text-sm font-medium text-teal-700">Session complete — well done.</p>
      )}
      <div className="mt-6 flex justify-center gap-3">
        <Button
          type="button"
          onClick={running ? pause : start}
          className="rounded-full bg-teal-600 px-6 hover:bg-teal-500"
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

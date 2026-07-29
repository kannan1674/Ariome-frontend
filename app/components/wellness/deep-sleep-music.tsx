'use client';

import { cn } from '@/lib/utils';
import {
  getActiveSoundId,
  playAmbientSound,
  setAmbientVolume,
  stopAmbientSound,
} from '@/lib/wellness/ambientAudio';
import { DEEP_SLEEP_SOUNDS } from '@/lib/wellness/sounds';
import type { AmbientSoundId } from '@/lib/wellness/types';
import { Moon, Volume2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const DEFAULT_VOLUME = 0.22;

export default function DeepSleepMusic() {
  const [activeId, setActiveId] = useState<AmbientSoundId | null>(null);
  const [volume, setVolume] = useState(DEFAULT_VOLUME);

  useEffect(() => {
    return () => stopAmbientSound();
  }, []);

  const toggle = (id: AmbientSoundId) => {
    if (activeId === id || getActiveSoundId() === id) {
      stopAmbientSound();
      setActiveId(null);
      return;
    }
    playAmbientSound(id, volume);
    setActiveId(id);
  };

  const onVolume = (v: number) => {
    setVolume(v);
    setAmbientVolume(v);
    if (activeId) playAmbientSound(activeId, v);
  };

  return (
    <div className="rounded-2xl border border-indigo-200/80 bg-gradient-to-b from-slate-900 to-indigo-950 p-5 text-white shadow-sm">
      <div className="flex items-center gap-2">
        <Moon className="size-5 text-indigo-300" aria-hidden />
        <h3 className="text-base font-semibold">Deep sleep music</h3>
      </div>
      <p className="mt-1 text-sm text-indigo-200/90">
        Low-frequency tones and gentle pulses designed for drifting off.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {DEEP_SLEEP_SOUNDS.map((sound) => {
          const playing = activeId === sound.id;
          return (
            <button
              key={sound.id}
              type="button"
              onClick={() => toggle(sound.id)}
              className={cn(
                'rounded-xl border p-3 text-left transition',
                playing
                  ? 'border-indigo-400 bg-indigo-900/60 ring-1 ring-indigo-400/50'
                  : 'border-indigo-800/60 bg-indigo-950/40 hover:border-indigo-600',
              )}
            >
              <span className="text-2xl" aria-hidden>
                {sound.emoji}
              </span>
              <p className="mt-1 text-sm font-semibold text-white">{sound.label}</p>
              <p className="text-[10px] text-indigo-300/80">{sound.description}</p>
              {playing && (
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-indigo-300">
                  Playing
                </p>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex items-center gap-3">
        <Volume2 className="size-4 shrink-0 text-indigo-300" aria-hidden />
        <input
          type="range"
          min={0}
          max={0.5}
          step={0.02}
          value={volume}
          onChange={(e) => onVolume(Number(e.target.value))}
          className="h-2 w-full cursor-pointer accent-indigo-400"
          aria-label="Volume"
        />
      </div>
    </div>
  );
}

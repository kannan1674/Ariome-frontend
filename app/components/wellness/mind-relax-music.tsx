'use client';

import { cn } from '@/lib/utils';
import {
  getActiveSoundId,
  playAmbientSound,
  setAmbientVolume,
  stopAmbientSound,
} from '@/lib/wellness/ambientAudio';
import { MIND_RELAX_SOUNDS } from '@/lib/wellness/sounds';
import type { AmbientSoundId } from '@/lib/wellness/types';
import { Brain, Pause, Play, Volume2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const DEFAULT_VOLUME = 0.3;

export default function MindRelaxMusic() {
  const [activeId, setActiveId] = useState<AmbientSoundId | null>(null);
  const [volume, setVolume] = useState(DEFAULT_VOLUME);

  useEffect(() => {
    return () => stopAmbientSound();
  }, []);

  const playing = activeId !== null && getActiveSoundId() === activeId;

  const togglePlay = (id: AmbientSoundId = 'mindRelax') => {
    if (playing && activeId === id) {
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
    <div className="rounded-2xl border border-teal-200/80 bg-gradient-to-br from-teal-50/90 via-white to-emerald-50/60 p-5 shadow-sm ring-1 ring-teal-100/80">
      <div className="flex items-center gap-2">
        <Brain className="size-5 text-teal-600" aria-hidden />
        <h3 className="text-base font-semibold text-gray-900">Mind relaxing music</h3>
      </div>
      <p className="mt-1 text-sm text-gray-600">
        Gentle soundscapes to ease stress and quiet your thoughts.
      </p>

      <button
        type="button"
        onClick={() => togglePlay(activeId ?? 'mindRelax')}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-teal-500"
      >
        {playing ? (
          <>
            <Pause className="size-5" aria-hidden />
            Pause music
          </>
        ) : (
          <>
            <Play className="size-5 fill-current" aria-hidden />
            Play mind relaxing music
          </>
        )}
      </button>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {MIND_RELAX_SOUNDS.map((sound) => {
          const isActive = activeId === sound.id && playing;
          return (
            <button
              key={sound.id}
              type="button"
              onClick={() => togglePlay(sound.id)}
              className={cn(
                'rounded-xl border p-3 text-left transition',
                isActive
                  ? 'border-teal-500 bg-teal-50 ring-1 ring-teal-200'
                  : 'border-gray-200 bg-white hover:border-teal-200 hover:bg-teal-50/40',
              )}
            >
              <span className="text-2xl" aria-hidden>
                {sound.emoji}
              </span>
              <p className="mt-1 text-sm font-semibold text-gray-900">{sound.label}</p>
              <p className="text-[10px] text-gray-500">{sound.description}</p>
              {isActive && (
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-teal-600">
                  Playing
                </p>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex items-center gap-3">
        <Volume2 className="size-4 shrink-0 text-gray-500" aria-hidden />
        <input
          type="range"
          min={0}
          max={0.6}
          step={0.02}
          value={volume}
          onChange={(e) => onVolume(Number(e.target.value))}
          className="h-2 w-full cursor-pointer accent-teal-600"
          aria-label="Volume"
        />
      </div>
    </div>
  );
}

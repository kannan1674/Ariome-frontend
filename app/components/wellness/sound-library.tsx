'use client';

import { cn } from '@/lib/utils';
import {
  getActiveSoundId,
  playAmbientSound,
  setAmbientVolume,
  stopAmbientSound,
} from '@/lib/wellness/ambientAudio';
import { AMBIENT_SOUNDS } from '@/lib/wellness/sounds';
import type { AmbientSoundId } from '@/lib/wellness/types';
import { Music, Volume2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function SoundLibrary() {
  const [activeId, setActiveId] = useState<AmbientSoundId | null>(null);
  const [volume, setVolume] = useState(0.35);

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
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm ring-1 ring-gray-100/80">
      <div className="flex items-center gap-2">
        <Music className="size-5 text-violet-600" aria-hidden />
        <h3 className="text-base font-semibold text-gray-900">Sound library</h3>
      </div>
      <p className="mt-1 text-sm text-gray-600">Ambient loops for focus, rest, and sleep.</p>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {AMBIENT_SOUNDS.map((sound) => {
          const playing = activeId === sound.id;
          return (
            <button
              key={sound.id}
              type="button"
              onClick={() => toggle(sound.id)}
              className={cn(
                'rounded-xl border p-3 text-left transition',
                playing
                  ? 'border-violet-500 bg-violet-50 ring-1 ring-violet-200'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
              )}
            >
              <span className="text-2xl" aria-hidden>
                {sound.emoji}
              </span>
              <p className="mt-1 text-sm font-semibold text-gray-900">{sound.label}</p>
              <p className="text-[10px] text-gray-500">{sound.description}</p>
              {playing && (
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-violet-600">
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
          max={1}
          step={0.05}
          value={volume}
          onChange={(e) => onVolume(Number(e.target.value))}
          className="h-2 w-full cursor-pointer accent-violet-600"
          aria-label="Volume"
        />
      </div>
    </div>
  );
}

'use client';

import { cn } from '@/lib/utils';
import {
  BookOpen,
  Brain,
  Clock,
  Moon,
  Music,
  Wind,
  type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';
import BreathingAnimation from './breathing-animation';
import MeditationTimer from './meditation-timer';
import MindRelaxMusic from './mind-relax-music';
import SleepStories from './sleep-stories';
import SleepWellnessHub from './sleep-wellness-hub';
import SoundLibrary from './sound-library';
import StreakBanner from './streak-banner';

type ToolId = 'meditation' | 'relax' | 'sleep' | 'stories' | 'breathing' | 'sounds';

const TOOLS: { id: ToolId; label: string; icon: LucideIcon; color: string }[] = [
  { id: 'meditation', label: 'Meditate', icon: Clock, color: 'teal' },
  { id: 'relax', label: 'Relax', icon: Brain, color: 'teal' },
  { id: 'sleep', label: 'Sleep', icon: Moon, color: 'indigo' },
  { id: 'stories', label: 'Stories', icon: BookOpen, color: 'indigo' },
  { id: 'breathing', label: 'Breathe', icon: Wind, color: 'cyan' },
  { id: 'sounds', label: 'Sounds', icon: Music, color: 'violet' },
];

export default function WellnessToolkit() {
  const [active, setActive] = useState<ToolId>('meditation');
  const [streakKey, setStreakKey] = useState(0);

  const onComplete = () => setStreakKey((k) => k + 1);

  return (
    <section className="mt-8" aria-labelledby="toolkit-heading">
      <StreakBanner refreshKey={streakKey} />

      <div className="mt-6">
        <h2 id="toolkit-heading" className="text-xl font-semibold text-white sm:text-2xl">
          Wellness toolkit
        </h2>
        <p className="mt-1 text-sm text-white/55">
          AI sleep plan, deep sleep music, dream journal, timers, stories, and streaks.
        </p>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {TOOLS.map((t) => {
          const Icon = t.icon;
          const selected = active === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActive(t.id)}
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition',
                selected
                  ? 'border-[var(--ariome-gold)]/50 bg-[var(--ariome-gold-muted)] text-[var(--ariome-gold-soft)] shadow-sm'
                  : 'border-white/15 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/90',
              )}
            >
              <Icon className="size-4" aria-hidden />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="mt-5">
        {active === 'meditation' && <MeditationTimer onSessionComplete={onComplete} />}
        {active === 'relax' && <MindRelaxMusic />}
        {active === 'sleep' && <SleepWellnessHub onSessionComplete={onComplete} />}
        {active === 'stories' && <SleepStories onSessionComplete={onComplete} />}
        {active === 'breathing' && <BreathingAnimation onSessionComplete={onComplete} />}
        {active === 'sounds' && <SoundLibrary />}
      </div>
    </section>
  );
}

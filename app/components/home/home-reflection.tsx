'use client';

import Link from 'next/link';
import { ChevronRight, Lightbulb } from 'lucide-react';
import { StreamingCard } from '@/app/components/streaming';

const REFLECTIONS = [
  'Who in your life needs your compassion today? How might you offer it?',
  'What is one small thing you are grateful for right now?',
  'Where can you create five minutes of stillness today?',
];

function pickReflection() {
  const day = Math.floor(Date.now() / 86_400_000);
  return REFLECTIONS[day % REFLECTIONS.length];
}

export function HomeReflection() {
  const reflection = pickReflection();

  return (
    <Link href="/journal" className="block group">
      <StreamingCard accent="violet" className="transition hover:bg-[var(--ariome-surface-hover)]">
        <div className="flex items-center gap-2 text-[var(--ariome-violet)]">
          <Lightbulb className="size-4 shrink-0" strokeWidth={1.75} />
          <span className="ariome-label text-[var(--ariome-violet)]">Today&apos;s reflection</span>
        </div>
        <p className="mt-4 font-serif text-base leading-relaxed text-[var(--ariome-text)] sm:text-lg">
          {reflection}
        </p>
        <p className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[var(--ariome-text-faint)] transition group-hover:text-[var(--ariome-gold-soft)]">
          Write in journal
          <ChevronRight className="size-4 transition group-hover:translate-x-0.5" />
        </p>
      </StreamingCard>
    </Link>
  );
}

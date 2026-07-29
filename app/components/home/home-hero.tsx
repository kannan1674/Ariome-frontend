'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Play, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

type HomeHeroProps = {
  name: string;
  dateLabel: string;
  selectedMood?: string | null;
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function HomeHero({ name, dateLabel, selectedMood }: HomeHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[var(--ariome-radius-xl)] ring-1 ring-[var(--ariome-border)] shadow-[var(--ariome-shadow)]">
      <div className="absolute inset-0">
        <Image
          src="/media/auth/hero-meditation.jpg"
          alt="Wellness meditation"
          fill
          priority
          className="object-cover object-[center_30%] saturate-[1.08]"
          sizes="(max-width: 768px) 100vw, 1200px"
        />
        {/* Left scrim for text — light in light mode, dark in dark mode */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/92 via-white/55 to-white/10 sm:from-white/88 sm:via-white/45 sm:to-transparent dark:from-zinc-950/95 dark:via-zinc-950/70 dark:to-zinc-950/15 sm:dark:from-zinc-950/92 sm:dark:via-zinc-950/55 sm:dark:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-white/75 via-transparent to-white/25 dark:from-zinc-950/80 dark:via-transparent dark:to-zinc-950/40" />
        <div
          className="absolute inset-0 opacity-60 mix-blend-soft-light dark:opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(circle at 75% 40%, rgba(139,92,246,0.2), transparent 50%), radial-gradient(circle at 25% 80%, rgba(20,184,166,0.15), transparent 45%)',
          }}
          aria-hidden
        />
      </div>

      <div className="relative grid min-h-[min(44vh,380px)] grid-cols-1 items-end sm:min-h-[min(48vh,420px)] sm:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col justify-end px-5 pb-7 pt-14 sm:px-8 sm:pb-9 lg:px-10">
          <p className="ariome-label flex items-center gap-2">
            <Sparkles className="size-3.5 text-[var(--ariome-gold)]" />
            AriOme · Wellness OTT
          </p>
          <h1 className="ariome-display mt-3 text-[1.75rem] font-semibold leading-tight text-slate-900 dark:text-white sm:text-4xl lg:text-[2.75rem]">
            {getGreeting()}, {name}
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 sm:text-base">{dateLabel}</p>
          {selectedMood ? (
            <p className="mt-2 text-sm font-medium text-purple-700 dark:text-purple-300">
              Today you feel <span className="capitalize">{selectedMood}</span>
            </p>
          ) : (
            <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Take a breath. Pick a mood below, then continue your wellness journey.
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button asChild className="ariome-btn-primary h-11 rounded-full px-6 text-sm font-semibold">
              <Link href="/explore">
                <Play className="mr-2 size-4 fill-current" />
                Start watching
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="ariome-btn-ghost h-11 rounded-full px-6 text-sm font-medium dark:border-white/25 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
            >
              <Link href="/practice">
                Guided practice
                <ChevronRight className="ml-1 size-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Spacer column — keeps photo visible on desktop */}
        <div className="hidden min-h-[200px] sm:block" aria-hidden />
      </div>
    </section>
  );
}

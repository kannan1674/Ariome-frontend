'use client';

import type { ReactNode } from 'react';
import { Clapperboard, Heart, Play, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AuthCinematicBackground } from '@/components/auth/AuthCinematicBackground';
import { AuthFormPanel, AuthGlassCard, AuthHeroImage } from '@/components/auth/AuthGlassCard';
import {
  authMoodPillClass,
  authPageCopy,
  type AuthPageVariant,
} from '@/components/auth/authTheme';

export type AuthSplitVariant = AuthPageVariant;

export const authFieldClass =
  'h-11 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 shadow-sm transition-colors placeholder:text-zinc-400 focus-visible:border-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-900/15';

export const authLabelClass =
  'text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500';

type AuthSplitLayoutProps = {
  variant: AuthSplitVariant;
  children: ReactNode;
  className?: string;
};

function HeroContent({
  headline,
  lines,
  moods,
  compact = false,
}: {
  headline: string;
  lines: string[];
  moods: string[];
  compact?: boolean;
}) {
  return (
    <>
      <div className="flex items-center gap-2 sm:gap-2.5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-teal-400/30 to-indigo-500/30 ring-1 ring-white/25 backdrop-blur-md sm:size-9 sm:rounded-xl">
          <Sparkles className="size-3.5 text-teal-100 sm:size-4" />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/90 sm:text-[11px] sm:tracking-[0.24em]">
          AriOme · Wellness OTT
        </p>
      </div>

      <div className={cn('flex flex-col gap-3 sm:gap-5', compact ? 'pt-3' : 'mt-auto pb-2 pt-6 sm:pt-12')}>
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <h2 className="text-xl font-bold leading-[1.12] tracking-tight text-white drop-shadow-lg sm:text-2xl md:max-w-none lg:text-[2rem]">
            {headline}
          </h2>
          {!compact && (
            <div className="hidden shrink-0 gap-2 rounded-2xl bg-white/10 p-2 backdrop-blur-md sm:flex">
              <Clapperboard className="size-6 text-teal-100 sm:size-7" strokeWidth={1.25} aria-hidden />
              <Heart className="size-6 text-fuchsia-100 sm:size-7" strokeWidth={1.25} aria-hidden />
            </div>
          )}
        </div>

        <div className="space-y-2 text-sm leading-relaxed text-white/85 drop-shadow">
          <p>{lines[0]}</p>
          {!compact && lines[1] ? (
            <p className="hidden text-white/75 sm:block">{lines[1]}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-1.5 pt-0.5 sm:gap-2 sm:pt-1">
          {moods.map((mood) => (
            <span key={mood} className={authMoodPillClass}>
              {mood}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}

export function AuthSplitLayout({ variant, children, className }: AuthSplitLayoutProps) {
  const { headline, lines, moods, heroImage, accent } = authPageCopy[variant];

  return (
    <AuthCinematicBackground className={className}>
      <AuthGlassCard variant="split">
        <div className="flex min-h-0 flex-col md:min-h-[560px] md:flex-row">
          {/* Form first on mobile for faster access */}
          <AuthFormPanel className="order-1 md:order-2">{children}</AuthFormPanel>

          {/* Mobile hero strip — below form */}
          <div className="relative order-2 h-[11.5rem] w-full shrink-0 overflow-hidden md:hidden">
            <AuthHeroImage src={heroImage} alt="Wellness streaming" className="absolute inset-0" />
            <div className={cn('pointer-events-none absolute inset-0 bg-gradient-to-br', accent)} aria-hidden />
            <div className="relative z-[1] flex h-full flex-col justify-end p-4">
              <HeroContent headline={headline} lines={lines} moods={moods} compact />
            </div>
          </div>

          {/* Desktop hero panel */}
          <aside className="relative order-2 hidden min-h-0 w-full flex-col justify-end overflow-hidden md:order-1 md:flex md:min-h-[560px] md:w-[44%] lg:w-[46%]">
            <AuthHeroImage
              src={heroImage}
              alt="Wellness streaming"
              className="absolute inset-0"
              priority
            />
            <div className={cn('pointer-events-none absolute inset-0 bg-gradient-to-br', accent)} aria-hidden />

            <div className="pointer-events-none absolute inset-0 hidden items-center justify-center opacity-20 md:flex" aria-hidden>
              <div className="flex size-36 items-center justify-center rounded-full border-[3px] border-white/80 bg-white/10 backdrop-blur-sm">
                <Play className="ml-2 size-16 text-white" fill="currentColor" strokeWidth={0} />
              </div>
            </div>

            <div className="relative z-[1] flex flex-1 flex-col p-6 sm:p-8">
              <HeroContent headline={headline} lines={lines} moods={moods} />
            </div>
          </aside>
        </div>
      </AuthGlassCard>
    </AuthCinematicBackground>
  );
}

'use client';

import type { ReactNode } from 'react';
import Image from 'next/image';
import { Clapperboard, Heart, Play, Sparkles, Waves } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AUTH_IMAGES } from '@/components/auth/authTheme';

type AuthCinematicBackgroundProps = {
  children: ReactNode;
  className?: string;
  centered?: boolean;
};

export function AuthCinematicBackground({
  children,
  className,
  centered = true,
}: AuthCinematicBackgroundProps) {
  return (
    <div
      className={cn(
        'relative min-h-[100dvh] w-full overflow-x-hidden bg-[#050810]',
        centered
          ? 'flex flex-col items-center justify-center px-3 py-4 sm:px-5 sm:py-8 md:py-10'
          : '',
        className,
      )}
    >
      {/* Full-page photo background */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <Image
          src={AUTH_IMAGES.background}
          alt=""
          fill
          priority
          className="object-cover object-center scale-105 md:scale-100"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-teal-600/45 via-indigo-900/65 to-fuchsia-900/55 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050810]/95 via-[#0a1020]/60 to-[#050810]/75 md:from-[#050810]/90 md:via-[#0a1020]/50 md:to-[#050810]/70" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_10%,rgba(45,212,191,0.35),transparent_55%),radial-gradient(ellipse_70%_50%_at_90%_80%,rgba(167,139,250,0.3),transparent_50%)]" />
      </div>

      {/* Floating image tiles — desktop only */}
      <div className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden>
        <div className="absolute left-[4%] top-[14%] size-36 rotate-[-8deg] overflow-hidden rounded-2xl border-2 border-white/20 shadow-2xl shadow-teal-900/40">
          <Image src={AUTH_IMAGES.meditation} alt="" fill className="object-cover" sizes="144px" />
          <div className="absolute inset-0 bg-teal-500/20 mix-blend-overlay" />
        </div>
        <div className="absolute right-[5%] top-[22%] size-32 rotate-[6deg] overflow-hidden rounded-2xl border-2 border-white/20 shadow-2xl shadow-indigo-900/40">
          <Image src={AUTH_IMAGES.cinema} alt="" fill className="object-cover" sizes="128px" />
          <div className="absolute inset-0 bg-indigo-500/25 mix-blend-overlay" />
        </div>
        <div className="absolute bottom-[12%] left-[8%] size-28 rotate-[4deg] overflow-hidden rounded-xl border border-white/15 opacity-80 shadow-xl">
          <Image src={AUTH_IMAGES.cinema} alt="" fill className="object-cover" sizes="112px" />
        </div>
      </div>

      {/* Color orbs + icons */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-24 top-[8%] size-48 rounded-full bg-teal-400/20 blur-3xl animate-pulse md:-left-16 md:size-80 md:bg-teal-400/25" />
        <div className="absolute -right-20 top-[20%] size-56 rounded-full bg-indigo-500/20 blur-3xl animate-pulse [animation-delay:1s] md:size-96 md:bg-indigo-500/25" />
        <div className="absolute bottom-[6%] left-[30%] size-40 rounded-full bg-fuchsia-500/15 blur-3xl animate-pulse [animation-delay:2s] md:bottom-[8%] md:left-[40%] md:size-72 md:bg-fuchsia-500/20" />
        <Waves className="absolute bottom-6 left-4 size-10 text-teal-200/25 sm:bottom-10 sm:left-10 sm:size-14 sm:text-teal-200/30" strokeWidth={1.25} />
        <Clapperboard className="absolute right-4 top-16 size-9 text-indigo-200/20 sm:right-12 sm:top-20 sm:size-12 sm:text-indigo-200/25 lg:top-[38%]" strokeWidth={1.25} />
        <Heart className="absolute left-[8%] top-[48%] size-8 text-fuchsia-200/25 sm:left-[15%] sm:top-[55%] sm:size-10 sm:text-fuchsia-200/30" strokeWidth={1.25} />
        <Sparkles className="absolute right-[10%] bottom-[14%] size-9 text-teal-200/30 sm:right-[20%] sm:bottom-[18%] sm:size-11 sm:text-teal-200/35" strokeWidth={1.25} />
        <div className="absolute left-1/2 top-[6%] hidden size-14 -translate-x-1/2 items-center justify-center rounded-full border border-white/25 bg-white/10 backdrop-blur-md sm:flex">
          <Play className="ml-0.5 size-6 text-white/70" fill="currentColor" strokeWidth={0} />
        </div>
      </div>

      <div className="relative z-[1] w-full max-w-[100vw]">{children}</div>
    </div>
  );
}

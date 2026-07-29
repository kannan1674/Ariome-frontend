'use client';

import type { ReactNode } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

type AuthGlassCardProps = {
  children: ReactNode;
  className?: string;
  variant?: 'split' | 'center';
};

export function AuthGlassCard({ children, className, variant = 'split' }: AuthGlassCardProps) {
  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-2xl p-[1px] md:rounded-3xl',
        'bg-gradient-to-br from-teal-400/70 via-indigo-400/50 to-fuchsia-500/60',
        'shadow-[0_20px_60px_-16px_rgba(20,184,166,0.3),0_16px_50px_-24px_rgba(99,102,241,0.35)] md:shadow-[0_32px_100px_-20px_rgba(20,184,166,0.35),0_24px_80px_-30px_rgba(99,102,241,0.4)]',
        variant === 'center'
          ? 'mx-auto max-w-[min(100%,440px)]'
          : 'mx-auto max-w-[min(100%,980px)]',
        className,
      )}
    >
      <div
        className={cn(
          'relative overflow-hidden rounded-[calc(1rem-1px)] backdrop-blur-2xl md:rounded-[calc(1.5rem-1px)]',
          variant === 'center' ? 'bg-[#0b1220]/92' : 'bg-white/[0.98] md:bg-white/95',
        )}
      >
        {children}
      </div>
    </div>
  );
}

type AuthFormPanelProps = {
  children: ReactNode;
  className?: string;
};

export function AuthFormPanel({ children, className }: AuthFormPanelProps) {
  return (
    <div
      className={cn(
        'relative flex w-full min-w-0 flex-1 flex-col justify-center overflow-visible',
        'px-4 py-6 sm:px-8 sm:py-9 md:px-12 md:py-11',
        'bg-gradient-to-br from-white via-teal-50/30 to-indigo-50/40',
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-400 via-indigo-500 to-fuchsia-500"
        aria-hidden
      />
      {children}
    </div>
  );
}

type AuthHeroImageProps = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
};

export function AuthHeroImage({ src, alt, className, priority }: AuthHeroImageProps) {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        className="object-cover object-center"
        sizes="(max-width: 768px) 100vw, 46vw"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/95 via-[#1e1b4b]/55 to-teal-900/25"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-gradient-to-br from-teal-500/20 via-transparent to-fuchsia-600/25 mix-blend-soft-light"
        aria-hidden
      />
    </div>
  );
}

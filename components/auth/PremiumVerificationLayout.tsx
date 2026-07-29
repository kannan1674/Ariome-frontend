'use client';

import type { ReactNode } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { AuthCinematicBackground } from '@/components/auth/AuthCinematicBackground';
import { AuthGlassCard } from '@/components/auth/AuthGlassCard';
import { AUTH_IMAGES } from '@/components/auth/authTheme';

type PremiumVerificationLayoutProps = {
  children: ReactNode;
  className?: string;
};

export function PremiumVerificationLayout({ children, className }: PremiumVerificationLayoutProps) {
  return (
    <AuthCinematicBackground className={className}>
      {children}
    </AuthCinematicBackground>
  );
}

type PremiumVerificationCardProps = {
  icon: ReactNode;
  title: string;
  subtitle: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  heroImage?: string;
};

export function PremiumVerificationCard({
  icon,
  title,
  subtitle,
  children,
  footer,
  className,
  heroImage = AUTH_IMAGES.meditation,
}: PremiumVerificationCardProps) {
  return (
    <AuthGlassCard variant="center" className={className}>
      <div className="relative overflow-hidden">
        <div className="relative h-24 w-full overflow-hidden sm:h-28">
          <Image src={heroImage} alt="" fill className="object-cover object-center" sizes="(max-width: 440px) 100vw" />
          <div className="absolute inset-0 bg-gradient-to-r from-teal-600/70 via-indigo-700/60 to-fuchsia-700/55 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b1220] via-transparent to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-teal-400 via-indigo-400 to-fuchsia-400" />
        </div>

        <div className="relative -mt-8 px-4 pb-6 pt-0 sm:-mt-10 sm:px-8 sm:pb-8">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl border-2 border-white/20 bg-gradient-to-br from-teal-500/40 via-indigo-600/40 to-fuchsia-600/30 text-white shadow-xl shadow-indigo-950/50 backdrop-blur-md sm:mb-5 sm:size-16">
            {icon}
          </div>

          <div className="mb-5 text-center sm:mb-6">
            <h1 className="bg-gradient-to-r from-teal-200 via-white to-indigo-200 bg-clip-text text-xl font-bold tracking-tight text-transparent sm:text-2xl">
              {title}
            </h1>
            <p className="mt-2 text-xs leading-relaxed text-zinc-400 sm:text-sm">{subtitle}</p>
          </div>

          {children}
          {footer ? <div className="mt-5 text-center sm:mt-6">{footer}</div> : null}
        </div>
      </div>
    </AuthGlassCard>
  );
}

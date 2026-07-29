'use client';

import { AmbientBackdrop } from '@/app/components/ariome/ambient-backdrop';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
import { StreamingBottomNav, type StreamingNavKey } from './streaming-bottom-nav';

type StreamingShellProps = {
  children: ReactNode;
  activeNav?: StreamingNavKey;
  className?: string;
  wide?: boolean;
};

export function StreamingShell({ children, activeNav, className, wide }: StreamingShellProps) {
  return (
    <div
      className={cn(
        'relative z-0 flex min-h-[100dvh] w-full flex-1 flex-col',
        activeNav ? 'pb-28 md:pb-12' : 'pb-10',
        className,
      )}
    >
      <AmbientBackdrop />
      <div
        className={cn(
          'relative z-[1] mx-auto w-full flex-1 space-y-10 px-4 pt-5 sm:px-8 sm:pt-8 lg:px-14',
          wide ? 'max-w-[1840px]' : 'max-w-5xl',
        )}
      >
        {children}
      </div>
      {activeNav ? <StreamingBottomNav active={activeNav} /> : null}
    </div>
  );
}

'use client';

import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type StreamingCardProps = {
  children: ReactNode;
  className?: string;
  accent?: 'gold' | 'violet' | 'none';
};

export function StreamingCard({ children, className, accent = 'none' }: StreamingCardProps) {
  return (
    <div
      className={cn(
        'ariome-glass rounded-[var(--ariome-radius-lg)] p-5 sm:p-6',
        accent === 'gold' && 'border-l-2 border-l-[var(--ariome-gold)]',
        accent === 'violet' && 'border-l-2 border-l-[var(--ariome-violet)]',
        className,
      )}
    >
      {children}
    </div>
  );
}

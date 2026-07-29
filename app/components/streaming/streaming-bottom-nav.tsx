'use client';

import Link from 'next/link';
import { BookOpen, Home, Search, Sparkles, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export type StreamingNavKey = 'home' | 'explore' | 'practice' | 'journal' | 'circles';

export function StreamingBottomNav({ active }: { active: StreamingNavKey }) {
  const item = (href: string, key: StreamingNavKey, icon: ReactNode, label: string) => (
    <Link
      href={href}
      className={cn(
        'flex flex-1 flex-col items-center gap-1 py-1.5 text-[10px] font-medium tracking-wide transition',
        active === key ? 'text-purple-600' : 'text-[var(--ariome-text-faint)] hover:text-[var(--ariome-text-muted)]',
      )}
    >
      <span
        className={cn(
          'flex size-9 items-center justify-center rounded-full transition',
          active === key && 'bg-purple-100 text-purple-700',
        )}
      >
        {icon}
      </span>
      {label}
    </Link>
  );

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(0.65rem,env(safe-area-inset-bottom))] pt-2 md:hidden"
      aria-label="Primary"
    >
      <div className="ariome-glass mx-auto flex max-w-md items-stretch justify-around rounded-2xl px-1 py-1 shadow-[var(--ariome-shadow)]">
        {item('/home', 'home', <Home className="size-[18px]" strokeWidth={active === 'home' ? 2.25 : 1.75} />, 'Home')}
        {item('/explore', 'explore', <Search className="size-[18px]" strokeWidth={active === 'explore' ? 2.25 : 1.75} />, 'Explore')}
        {item('/practice', 'practice', <Sparkles className="size-[18px]" strokeWidth={active === 'practice' ? 2.25 : 1.75} />, 'Practice')}
        {item('/journal', 'journal', <BookOpen className="size-[18px]" strokeWidth={active === 'journal' ? 2.25 : 1.75} />, 'Journal')}
        {item('/circles', 'circles', <Users className="size-[18px]" strokeWidth={active === 'circles' ? 2.25 : 1.75} />, 'Circles')}
      </div>
    </nav>
  );
}

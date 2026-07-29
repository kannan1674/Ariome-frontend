'use client';

import Link from 'next/link';
import { BookOpen, Compass, Sparkles, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const ACTIONS = [
  {
    href: '/explore',
    label: 'Explore',
    desc: 'Films & clips',
    icon: Compass,
    tint: 'from-violet-50 to-indigo-50/80 dark:from-violet-950/70 dark:to-indigo-950/50',
    iconColor: 'text-violet-600 dark:text-violet-300',
  },
  {
    href: '/practice',
    label: 'Practice',
    desc: 'Guided sessions',
    icon: Sparkles,
    tint: 'from-teal-50 to-emerald-50/80 dark:from-teal-950/70 dark:to-emerald-950/50',
    iconColor: 'text-teal-600 dark:text-teal-300',
  },
  {
    href: '/journal',
    label: 'Journal',
    desc: 'Reflect & write',
    icon: BookOpen,
    tint: 'from-amber-50 to-orange-50/80 dark:from-amber-950/70 dark:to-orange-950/50',
    iconColor: 'text-amber-600 dark:text-amber-300',
  },
  {
    href: '/circles',
    label: 'Circles',
    desc: 'Community',
    icon: Users,
    tint: 'from-fuchsia-50 to-purple-50/80 dark:from-fuchsia-950/70 dark:to-purple-950/50',
    iconColor: 'text-purple-600 dark:text-purple-300',
  },
] as const;

export function HomeQuickActions() {
  return (
    <section aria-label="Quick actions">
      <h2 className="sr-only">Quick actions</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {ACTIONS.map(({ href, label, desc, icon: Icon, tint, iconColor }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'group flex flex-col gap-3 rounded-[var(--ariome-radius-lg)] border border-[var(--ariome-border)] p-4 transition shadow-sm',
              'bg-gradient-to-br hover:border-[var(--ariome-border-strong)] hover:shadow-md',
              tint,
            )}
          >
            <span
              className={cn(
                'flex size-10 items-center justify-center rounded-xl bg-white ring-1 ring-[var(--ariome-border)] transition group-hover:scale-105 dark:bg-zinc-900/80 dark:ring-white/10',
                iconColor,
              )}
            >
              <Icon className="size-5" strokeWidth={1.75} />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{label}</p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

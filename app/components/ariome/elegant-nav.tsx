'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/home', label: 'Home' },
  { href: '/explore', label: 'Explore' },
  { href: '/practice', label: 'Practice' },
  { href: '/journal', label: 'Journal' },
  { href: '/circles', label: 'Circles' },
] as const;

export function ElegantNav({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        'ariome-premium-navbar hidden items-center gap-0.5 rounded-full bg-white px-1.5 py-1 shadow-[0_8px_28px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/80 dark:bg-zinc-900 dark:shadow-[0_8px_28px_rgba(0,0,0,0.35)] dark:ring-zinc-700 lg:flex',
        className,
      )}
      aria-label="Main"
    >
      {NAV.map(({ href, label }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            data-active={active ? 'true' : undefined}
            className="ariome-nav-pill ariome-nav-pill--premium"
          >
            <span className="ariome-nav-pill__glow" aria-hidden />
            <span className="relative z-[1]">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

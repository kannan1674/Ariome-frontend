'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

type ThemeToggleProps = {
  className?: string;
  compact?: boolean;
};

/**
 * Navbar light / dark toggle (next-themes).
 */
export function ThemeToggle({ className, compact = true }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      disabled={!mounted}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className={cn(
        'inline-flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-800 shadow-sm transition',
        'hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500',
        'disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800',
        compact ? 'size-8' : 'h-9 gap-1.5 px-3 text-xs font-semibold',
        className,
      )}
    >
      {isDark ? (
        <Sun className="size-3.5" aria-hidden />
      ) : (
        <Moon className="size-3.5" aria-hidden />
      )}
      {!compact && <span>{isDark ? 'Light' : 'Dark'}</span>}
    </button>
  );
}

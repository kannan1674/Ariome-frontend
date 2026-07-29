import { cn } from '@/lib/utils';

export function getPremiumFieldBorderClass(
  error: boolean,
  active: boolean,
  valid = false,
) {
  if (error) {
    return 'border-red-500 focus-within:border-red-500 focus-within:ring-red-200/60';
  }
  if (valid && active) {
    return 'border-emerald-500 focus-within:border-emerald-500 focus-within:ring-emerald-500/20';
  }
  if (active) {
    return 'border-teal-800 focus-within:border-teal-800 focus-within:ring-teal-900/15';
  }
  return 'border-zinc-200 focus-within:border-teal-800 focus-within:ring-teal-900/15';
}

export function getPremiumFieldLabelClass(
  error: boolean,
  active: boolean,
  valid = false,
) {
  if (error) return 'text-red-500';
  if (valid && active) return 'text-emerald-600';
  if (active) return 'text-teal-800';
  return 'text-zinc-500';
}

export const premiumFieldShellClass =
  'relative rounded-[14px] border-2 bg-white shadow-sm transition-all focus-within:ring-2';

export const premiumFieldInputClass =
  'h-[52px] w-full rounded-[14px] bg-transparent px-4 text-sm text-zinc-900 outline-none placeholder:text-zinc-400';

export const premiumFieldLabelClass =
  'pointer-events-none absolute left-3 top-0 z-10 -translate-y-1/2 bg-white px-1.5 text-xs font-semibold transition-colors';
